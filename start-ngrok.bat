:loop
ngrok http 4000 --region=ap --log=stdout
timeout /t 5
goto loop
