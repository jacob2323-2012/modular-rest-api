@echo on

SET TEST_DIR=%~dp0

REM Define general settings
SET BASE_DIR=%~dp0..\..\
CALL %BASE_DIR%\config\environment.bat

REM Handle param for locale (en, de)
SET LOCALE=%~1
IF "%LOCALE%"=="" (
    SET LOCALE=en
)

REM Define directory and files for Keystone-Logs
SET BASE_LOG_DIR_NAME=logs\%MY_LOGDATETIME%\%LOCALE%\
SET MY_LOG_DIR_NAME=%BASE_LOG_DIR_NAME%soapui\
SET MY_LOGDIR=%~dp0%MY_LOG_DIR_NAME%
mkdir %MY_LOGDIR%

REM Start MongoDB and cleanup test-db
SET TEST_DB_NAME=modular-rest-api_soapui
call "C:\Program Files\MongoDB\Server\3.6\bin\mongo.exe" %TEST_DB_NAME% --eval "db.dropDatabase()"

REM Start Keystone Server for test
SET KEYSTONE_WINDOW_NAME="KeystoneJS-Server_%MY_LOGDATETIME%"
Start %KEYSTONE_WINDOW_NAME% %BASE_DIR%start.bat %LOCALE% "coverage-test" "%TEST_DB_NAME%" "%~dp0" "tests\soapui\%BASE_LOG_DIR_NAME%" 

SET PROJECT_FILE="%~dp0Basic-REST-CRUD-soapui-project.xml"
cd %MY_LOGDIR%
call "C:\Program Files (x86)\SmartBear\SoapUI-5.4.0\bin\testrunner.bat" -ehttp://localhost:3000 -r -j -J -f%MY_LOGDIR% %PROJECT_FILE% > %MY_LOGDIR%test_run.log
cd %TEST_DIR%

call junit-viewer --results=%MY_LOG_DIR_NAME% --save=%MY_LOG_DIR_NAME%test_run.html --minify=false  --contracted

for /f "tokens=2 delims=," %%a in ('tasklist /fi "imagename eq cmd.exe" /v /fo:csv /nh ^| findstr /r /c:".*%KEYSTONE_WINDOW_NAME%[^,]*$" ') do taskkill /pid %%a
