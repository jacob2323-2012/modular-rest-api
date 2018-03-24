REM Define general settings
SET BASE_DIR=%~dp0
CALL %BASE_DIR%\config\environment.bat
cd %BASE_DIR%

REM Handle param for locale (en, de)
SET LOCALE=%~1
IF "%LOCALE%"=="" (
    SET LOCALE=en
)

REM Handle param for mode (development, coverage-test, production)
SET MODE=%~2
IF "%MODE%"=="" (
    SET MODE=development
)

REM Handle param for log_base
SET MONGO_DB_NAME=%~3
IF "%MONGO_DB_NAME%"=="" (
    SET MONGO_DB_NAME=modular-rest-api
)

REM Handle param for BASE_LOG_DIR_NAME
SET BASE_LOG_DIR_NAME=%~4
IF "%BASE_LOG_DIR_NAME%"=="" (
    SET BASE_LOG_DIR_NAME=logs\%ENV_LOGDATETIME%\
)

REM Handle param for HOST_AND_PORT
SET HOST_AND_PORT=%~5
IF "%HOST_AND_PORT%"=="" (
    SET HOST_AND_PORT=localhost:3000
)

REM Define directory and files for Keystone-Logs
SET MY_LOGDIR=%BASE_LOG_DIR_NAME%
mkdir %MY_LOGDIR%
SET MY_LOGFILE_OUT=%MY_LOGDIR%keystone_stdout.log
SET MY_LOGFILE_ERR=%MY_LOGDIR%keystone_stderr.log

REM Create or clear build directory... 
set BUILD_DIR=.\build
mkdir %BUILD_DIR%
del /s /f /q %BUILD_DIR%\*.*
for /f %%f in ('dir /ad /b %BUILD_DIR%\') do rd /s /q %BUILD_DIR%\%%f
REM ... and fill it dependent on mode...
IF "%MODE%"=="coverage-test" (
    call node_modules\.bin\istanbul instrument .\sources -o %BUILD_DIR% -x **/reportCoverage.js -x
)
REM ...at last fill the gaps left by istanbul (no replacement of existing files)
xcopy .\sources %BUILD_DIR% /S /D /Y

REM Create or clear update directory... 
set UPDATE_DIR=.\updates
mkdir %UPDATE_DIR%
del /s /f /q %UPDATE_DIR%\*.*
for /f %%f in ('dir /ad /b %UPDATE_DIR%\') do rd /s /q %UPDATE_DIR%\%%f
REM ...and copy localised init-script 
xcopy .\updates-stock\0.0.1-initialisation-%LOCALE%.js %UPDATE_DIR% /Y

REM Calling custom start allows to inject custom start operations here
IF EXIST "%~dp0custom_start.bat" CALL "%~dp0custom_start.bat"

REM Start Keystone
call node web --locale %LOCALE% --mode %MODE% --database %MONGO_DB_NAME% --log %BASE_LOG_DIR_NAME% --server %HOST_AND_PORT%> %MY_LOGFILE_OUT% 2>%MY_LOGFILE_ERR%
