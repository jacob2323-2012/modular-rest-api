@echo on

SET TEST_DIR=%~dp0

REM Define general settings
SET BASE_DIR=%~dp0..\..\
CALL %BASE_DIR%\config\environment.bat

REM Define directory and files for Keystone-Logs
SET ALL_LOG_DIR_NAME=logs\%MY_LOGDATETIME%\


call run_all_tests_in_one_language.bat "de"
call run_all_tests_in_one_language.bat "en"

call junit-viewer --results=%ALL_LOG_DIR_NAME% --save=%ALL_LOG_DIR_NAME%all_tests_run.html --minify=false  --contracted

call %BASE_DIR%node_modules\.bin\istanbul report --root %ALL_LOG_DIR_NAME% -dir %ALL_LOG_DIR_NAME%all_tests_coverage
