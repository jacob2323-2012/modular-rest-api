@echo on

SET TEST_DIR=%~dp0

REM Define general settings
SET BASE_DIR=%~dp0..\..\
CALL %BASE_DIR%\config\environment.bat

REM Define base directory for this test run and prepare container for all tests
SET BASE_LOG_DIR_NAME=logs\%MY_LOGDATETIME%\
SET MY_LOGDIR=%~dp0%BASE_LOG_DIR_NAME%all_tests
mkdir %MY_LOGDIR%

REM Run the tests for german and english locales
call run_all_tests_in_one_language.bat "de" %BASE_LOG_DIR_NAME%
call run_all_tests_in_one_language.bat "en" %BASE_LOG_DIR_NAME%

REM Collect test results and coverage from all runs and write it ti "all_test"
call junit-viewer --results=%BASE_LOG_DIR_NAME% --save=%BASE_LOG_DIR_NAME%all_tests\results.html --minify=false  --contracted
call %BASE_DIR%node_modules\.bin\istanbul report --root %BASE_LOG_DIR_NAME% -dir %BASE_LOG_DIR_NAME%all_tests\coverage html
