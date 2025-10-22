#!/bin/bash
# PaddleOCR PP-Structure V3 Setup Script
# This script helps set up the local PaddleOCR service for native extraction

set -e

echo "============================================"
echo "PaddleOCR PP-Structure V3 Setup"
echo "============================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip."
    exit 1
fi

echo "✅ pip3 found: $(pip3 --version)"
echo ""

# Ask user if they want to create a virtual environment
read -p "Do you want to create a virtual environment? (recommended) [Y/n]: " create_venv
create_venv=${create_venv:-Y}

if [[ $create_venv =~ ^[Yy]$ ]]; then
    echo ""
    echo "Creating virtual environment..."
    python3 -m venv paddleocr_env
    
    echo "Activating virtual environment..."
    source paddleocr_env/bin/activate
    
    echo "✅ Virtual environment created and activated"
    echo ""
fi

# Install dependencies
echo "Installing PaddleOCR dependencies..."
echo "This may take a few minutes..."
echo ""

pip3 install --upgrade pip

# Ask if user has GPU
read -p "Do you have a GPU and want to use GPU acceleration? [y/N]: " use_gpu
use_gpu=${use_gpu:-N}

if [[ $use_gpu =~ ^[Yy]$ ]]; then
    echo "Installing PaddlePaddle with GPU support..."
    pip3 install paddlepaddle-gpu>=2.5.0
else
    echo "Installing PaddlePaddle (CPU version)..."
    pip3 install paddlepaddle>=2.5.0
fi

echo ""
echo "Installing PaddleOCR and PP-Structure..."
pip3 install "paddleocr>=2.7.0"

echo ""
echo "Installing FastAPI and Uvicorn..."
pip3 install fastapi uvicorn[standard]

echo ""
echo "Installing additional dependencies..."
pip3 install opencv-python opencv-contrib-python shapely scikit-image

echo ""
echo "============================================"
echo "✅ Installation Complete!"
echo "============================================"
echo ""
echo "To start the PaddleOCR service:"
echo ""

if [[ $create_venv =~ ^[Yy]$ ]]; then
    echo "1. Activate the virtual environment:"
    echo "   source paddleocr_env/bin/activate"
    echo ""
fi

echo "2. Run the service:"
echo "   python3 paddleocr_service.py"
echo ""
echo "The service will start on http://localhost:8866"
echo ""
echo "To use it in the application:"
echo "1. Start the PaddleOCR service"
echo "2. Run the Next.js app: npm run dev"
echo "3. Select 'PaddleOCR (Native)' from the extraction method dropdown"
echo ""
echo "For more information, see docs/PADDLEOCR_SETUP.md"
echo ""
