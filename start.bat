
SET LOCALE=%~1
IF "%LOCALE%"=="" (
    SET LOCALE=en
)
SET SCRIPT_DIR=%~dp0
CALL %SCRIPT_DIR%\config\environment.bat
SET MY_LOGDIR=%SCRIPT_DIR%logs
mkdir %MY_LOGDIR%

SET LOG_FILENAME_PREFIX_OUT=keystone_stdout_
SET MY_LOGFILE_OUT=%MY_LOGDIR%\%LOG_FILENAME_PREFIX_OUT%%MY_LOGDATETIME%.log

SET LOG_FILENAME_PREFIX_ERR=keystone_stderr_
SET MY_LOGFILE_ERR=%MY_LOGDIR%\%LOG_FILENAME_PREFIX_ERR%%MY_LOGDATETIME%.log

del /s /f /q .\build\*.*
for /f %%f in ('dir /ad /b .\build\') do rd /s /q .\build\%%f

call node_modules\.bin\istanbul instrument .\sources -o .\build -x **/reportCoverage.js -x **/locales/**
xcopy .\sources .\build /S /D /Y

del /s /f /q .\updates\*.*
for /f %%f in ('dir /ad /b .\updates\') do rd /s /q .\updates\%%f
xcopy .\updates-stock\0.0.1-initialisation-%LOCALE%.js .\updates /Y

call node web --debug-mode --locale %LOCALE% > %MY_LOGFILE_OUT% 2>%MY_LOGFILE_ERR%
