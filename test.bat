rem copy updates-stock/0.0.1-initialisation-en.js updates

@echo on
SET LOG_DIR=%~dp0logs
SET project_file==%~dp0tests\soapui\Basic-REST-CRUD-soapui-project.xml
"C:\Program Files (x86)\SmartBear\SoapUI-5.4.0\bin\testrunner.bat" -r -I -f%LOG_DIR% %project_file% > %log_dir%\test_run.log
