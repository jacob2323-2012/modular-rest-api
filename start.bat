rem copy updates-stock/0.0.1-initialisation-en.js updates

SET LOG_DIR=%~dp0\logs

cd %~dp0source\keystone\
node web --debug-mode --locale en > %LOG_DIR%\stdout.log 2>%LOG_DIR%\stderr.log
cd..
cd..