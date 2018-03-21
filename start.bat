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

REM Define general settings
SET SCRIPT_DIR=%~dp0
CALL %SCRIPT_DIR%\config\environment.bat

REM Define directory and files for Keystone-Logs
SET MY_LOGDIR=%SCRIPT_DIR%logs
mkdir %MY_LOGDIR%
SET LOG_FILENAME_PREFIX_OUT=keystone_stdout_
SET MY_LOGFILE_OUT=%MY_LOGDIR%\%LOG_FILENAME_PREFIX_OUT%%MY_LOGDATETIME%.log
SET LOG_FILENAME_PREFIX_ERR=keystone_stderr_
SET MY_LOGFILE_ERR=%MY_LOGDIR%\%LOG_FILENAME_PREFIX_ERR%%MY_LOGDATETIME%.log

REM Create or clear build directory... 
set BUILD_DIR=.\build
mkdir %BUILD_DIR%
del /s /f /q %BUILD_DIR%\*.*
for /f %%f in ('dir /ad /b %BUILD_DIR%\') do rd /s /q %BUILD_DIR%\%%f
REM ... and fill it dependent on mode...
IF "%MODE%"=="coverage-test" (
    call node_modules\.bin\istanbul instrument .\sources -o %BUILD_DIR% -x **/reportCoverage.js -x **/locales/**
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
call node web --locale %LOCALE% --mode %MODE% > %MY_LOGFILE_OUT% 2>%MY_LOGFILE_ERR%
