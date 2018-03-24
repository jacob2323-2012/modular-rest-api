@echo off

SET TEST_DIR=%~dp0

REM Define general settings
SET BASE_DIR=%~dp0..\..\
CALL %BASE_DIR%\config\environment.bat

REM Handle param for locale (en, de)
SET LOCALE=%~1
IF "%LOCALE%"=="" (
    SET LOCALE=en
)

REM Handle param for BASE_LOG_DIR_NAME
SET BASE_LOG_DIR_NAME=%~2
IF "%BASE_LOG_DIR_NAME%"=="" (
    SET BASE_LOG_DIR_NAME=logs\%MY_LOGDATETIME%\
)

REM Relative base_dir for logs (given as well to Start.bat as base_log_dir)
SET LOCALE_BASE_LOG_DIR_NAME=%BASE_LOG_DIR_NAME%%LOCALE%\

REM Relative dir for soap-ui Logs (used as well by junit-viewer)
SET SOAP_LOG_DIR_NAME=%LOCALE_BASE_LOG_DIR_NAME%soapui\

REM Absoute path for soap-ui needed by Soap-UI itself
SET MY_LOGDIR=%~dp0%SOAP_LOG_DIR_NAME%
mkdir %MY_LOGDIR%

REM Delete test-database from MongoDB
SET TEST_DB_NAME=modular-rest-api_soapui
call "C:\Program Files\MongoDB\Server\3.6\bin\mongo.exe" %TEST_DB_NAME% --eval "db.dropDatabase()"

REM Start Keystone Server for test
SET KEYSTONE_WINDOW_NAME="KeystoneJS-Server_%MY_LOGDATETIME%"
Start %KEYSTONE_WINDOW_NAME% %BASE_DIR%start.bat %LOCALE% "coverage-test" "%TEST_DB_NAME%" "%~dp0%LOCALE_BASE_LOG_DIR_NAME%" 

REM RUN the SOAP-UI tests
SET PROJECT_FILE="%~dp0Basic-REST-CRUD-soapui-project.xml"
cd %MY_LOGDIR%
call "C:\Program Files (x86)\SmartBear\SoapUI-5.4.0\bin\testrunner.bat" -ehttp://localhost:3000 -r -j -J -f%MY_LOGDIR% %PROJECT_FILE% > %MY_LOGDIR%test_run.log
cd %TEST_DIR%

REM Create HTML out of soap-ui's junit results
call junit-viewer --results=%SOAP_LOG_DIR_NAME% --save=%SOAP_LOG_DIR_NAME%results.html --minify=false  --contracted

REM Kill Keystone cmd-box
for /f "tokens=2 delims=," %%a in ('tasklist /fi "imagename eq cmd.exe" /v /fo:csv /nh ^| findstr /r /c:".*%KEYSTONE_WINDOW_NAME%[^,]*$" ') do taskkill /pid %%a
