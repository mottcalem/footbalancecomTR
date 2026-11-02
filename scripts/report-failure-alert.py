#!/usr/bin/env python3
"""Report-service failure alerts using only Python's standard library."""
import argparse
from datetime import datetime
from email.message import EmailMessage
from email.utils import formatdate, make_msgid
from html import escape
import json
import os
from pathlib import Path
import re
import smtplib
import ssl
import subprocess
import time
from zoneinfo import ZoneInfo


def command(*args):
    return subprocess.run(args, check=True, capture_output=True, text=True, timeout=15).stdout


def error_details(logs):
    """Keep exception messages and stack frames, excluding unrelated payloads."""
    lines = []
    for line in logs.splitlines():
        if re.search(r'Error|Exception|Traceback|Lead report failed:|^\s+at |^\s+File |code:|errno:|syscall:|Cannot find package', line):
            lines.append(line[:1000])
    detail = '\n'.join(lines[-35:]) or 'Uygulama hata mesajı üretmedi. Servis sonucu ve çıkış kodu yukarıdadır.'
    for key, value in os.environ.items():
        if any(word in key.upper() for word in ('PASSWORD', 'SECRET', 'TOKEN', 'API_KEY')) and value:
            detail = detail.replace(value, '[GİZLENDİ]')
    detail = re.sub(r'https?://\S+', '[URL GİZLENDİ]', detail)
    detail = re.sub(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}', '[E-POSTA GİZLENDİ]', detail)
    return detail


def set_body(message, body):
    # Both alternatives use base64, matching the working report-mail encoding.
    message.set_content(body, charset='utf-8', cte='base64')
    message.add_alternative(
        '<!doctype html><html lang="tr"><body style="font-family:Arial,sans-serif;color:#00263e">'
        '<h2>FootBalance — Lead raporu hata bildirimi</h2>'
        '<pre style="white-space:pre-wrap;overflow-wrap:anywhere;font-family:Arial,sans-serif;line-height:1.6">'
        + escape(body) + '</pre></body></html>',
        subtype='html', charset='utf-8', cte='base64',
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--unit', required=True, choices=[
        'footbalance-lead-report.service', 'footbalance-lead-report-alert-test.service',
    ])
    args = parser.parse_args()
    test = args.unit.endswith('-test.service')
    state = Path('/var/lib/footbalance-report-alert') / (args.unit + '.json')
    state.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    now = time.time()
    try:
        last = json.loads(state.read_text())
    except (FileNotFoundError, ValueError):
        last = {}
    # Every retry still runs the report; email at most once per six hours.
    if not test and now - last.get('sent_at', 0) < 6 * 3600:
        print('Failure alert suppressed: already notified within six hours')
        return
    status = command('systemctl', 'show', args.unit,
                     '-p', 'Result', '-p', 'ExecMainStatus', '-p', 'ExecMainCode').strip()
    started = command('systemctl', 'show', args.unit, '-p', 'ExecMainStartTimestamp', '--value').strip()
    journal_args = ['journalctl', '-u', args.unit, '-n', '80', '--no-pager', '-o', 'cat']
    if started and started != 'n/a':
        journal_args.extend(['--since', started])
    logs = command(*journal_args)
    codes = sorted(set(re.findall(r'\bERR_[A-Z_]+\b', logs)))
    packages = sorted(set(re.findall(r"Cannot find package '([A-Za-z0-9_@/.-]+)'", logs)))
    diagnosis = ', '.join(codes) or 'Servis başarısız oldu; ayrıntılar sunucu günlüğünde.'
    if packages:
        diagnosis += '\nEksik paket: ' + ', '.join(packages)
    stamp = datetime.now(ZoneInfo('Europe/Istanbul')).strftime('%d.%m.%Y %H:%M:%S')
    message = EmailMessage()
    message['From'] = os.environ['SMTP_FROM']
    message['To'] = os.environ['FOOTBALANCE_ALERT_TO']
    message['Subject'] = ('[TEST] ' if test else '') + 'FootBalance — Lead raporu gönderilemedi'
    message['Date'] = formatdate(localtime=False)
    message['Message-ID'] = make_msgid(domain='footbalance.com.tr')
    set_body(message,
        f'{"Bu bir otomatik hata bildirimi testidir." if test else "Haftalık lead raporu servisi hata verdi."}\n\n'
        f'Sunucu: 45.43.154.82\nTürkiye saati: {stamp}\nServis: {args.unit}\n'
        f'{status}\n\nTanı: {diagnosis}\n\nHata ayrıntıları:\n{error_details(logs)}\n\n'
        'Üretim raporu başarısız olduğunda 15 dakikada bir yeniden denenir. '
        'Aynı servis için hata e-postaları altı saatte bir ile sınırlıdır.\n'
    )
    host = os.environ['SMTP_HOST']
    port = int(os.environ.get('SMTP_PORT', '587'))
    context = ssl.create_default_context()
    if port == 465:
        smtp = smtplib.SMTP_SSL(host, port, timeout=20, context=context)
    else:
        smtp = smtplib.SMTP(host, port, timeout=20)
    with smtp:
        if port != 465:
            smtp.starttls(context=context)
        smtp.login(os.environ['SMTP_USER'], os.environ['SMTP_PASSWORD'])
        rejected = smtp.send_message(message)
        if rejected:
            raise RuntimeError('Alert recipient rejected')
    temporary = state.with_suffix('.tmp')
    temporary.write_text(json.dumps({'sent_at': now}))
    temporary.chmod(0o600)
    temporary.replace(state)
    print('Failure alert accepted by SMTP' + (' (test)' if test else ''))


if __name__ == '__main__':
    main()
