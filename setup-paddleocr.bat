@echo off
REM PaddleOCR PP-Structure V3 Setup Script for Windows
REM This script helps set up the local PaddleOCR service for native extraction

echo ============================================
echo PaddleOCR PP-Structure V3 Setup
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo X Python 3 is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

echo √ Python 3 found
python --version
echo.

REM Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo X pip is not installed. Please install pip.
    pause
    exit /b 1
)

echo √ pip found
pip --version
echo.

REM Ask user if they want to create a virtual environment
set /p create_venv="Do you want to create a virtual environment? (recommended) [Y/n]: "
if "%create_venv%"=="" set create_venv=Y

if /i "%create_venv%"=="Y" (
    echo.
    echo Creating virtual environment...
    python -m venv paddleocr_env
    
    echo Activating virtual environment...
    call paddleocr_env\Scripts\activate.bat
    
    echo √ Virtual environment created and activated
    echo.
)

REM Install dependencies
echo Installing PaddleOCR dependencies...
echo This may take a few minutes...
echo.

python -m pip install --upgrade pip

REM Ask if user has GPU
set /p use_gpu="Do you have a GPU and want to use GPU acceleration? [y/N]: "
if "%use_gpu%"=="" set use_gpu=N

if /i "%use_gpu%"=="Y" (
    echo Installing PaddlePaddle with GPU support...
    pip install paddlepaddle-gpu>=2.5.0
) else (
    echo Installing PaddlePaddle (CPU version)...
    pip install paddlepaddle>=2.5.0
)

echo.
echo Installing PaddleOCR and PP-Structure...
pip install "paddleocr>=2.7.0"

echo.
echo Installing FastAPI and Uvicorn...
pip install fastapi uvicorn[standard]

echo.
echo Installing additional dependencies...
pip install opencv-python opencv-contrib-python shapely scikit-image

echo.
echo ============================================
echo √ Installation Complete!
echo ============================================
echo.
echo To start the PaddleOCR service:
echo.

if /i "%create_venv%"=="Y" (
    echo 1. Activate the virtual environment:
    echo    paddleocr_env\Scripts\activate.bat
    echo.
)

echo 2. Run the service:
echo    python paddleocr_service.py
echo.
echo The service will start on http://localhost:8866
echo.
echo To use it in the application:
echo 1. Start the PaddleOCR service
echo 2. Run the Next.js app: npm run dev
echo 3. Select 'PaddleOCR (Native)' from the extraction method dropdown
echo.
echo For more information, see docs\PADDLEOCR_SETUP.md
echo.
pause
