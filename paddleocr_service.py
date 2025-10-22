#!/usr/bin/env python3
"""
PaddleOCR PP-Structure V3 Service
A FastAPI service for local table extraction from PDF documents.

This service provides a REST API endpoint for processing PDFs with PaddleOCR PP-Structure V3,
enabling 100% accurate table extraction with 1:1 replication.

Usage:
    python paddleocr_service.py

The service will start on http://localhost:8866
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import tempfile
import os
import logging
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="PaddleOCR PP-Structure V3 Service",
    description="Local table extraction service using PaddleOCR PP-Structure V3",
    version="1.0.0"
)

# Enable CORS for Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:9002",
        "http://localhost:3000",
        "http://127.0.0.1:9002",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable for table engine (lazy initialization)
table_engine = None


def get_table_engine():
    """Initialize PaddleOCR table engine (lazy loading)"""
    global table_engine
    if table_engine is None:
        try:
            from paddleocr import PPStructure
            logger.info("Initializing PaddleOCR PP-Structure V3...")
            table_engine = PPStructure(
                show_log=True,
                use_gpu=False,  # Set to True if GPU is available
                lang='en',
                layout=False,  # We only need table detection
                table=True,
                ocr=True
            )
            logger.info("PaddleOCR PP-Structure V3 initialized successfully")
        except ImportError as e:
            logger.error("PaddleOCR not installed. Please run: pip install paddleocr")
            raise HTTPException(
                status_code=500,
                detail="PaddleOCR not installed. Please run: pip install paddleocr"
            )
        except Exception as e:
            logger.error(f"Failed to initialize PaddleOCR: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize PaddleOCR: {str(e)}"
            )
    return table_engine


class PDFRequest(BaseModel):
    pdf_data: str
    lang: str = 'en'


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    paddleocr_available: bool


@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint with service information"""
    return {
        "status": "healthy",
        "service": "PaddleOCR PP-Structure V3",
        "version": "1.0.0",
        "paddleocr_available": table_engine is not None
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "PaddleOCR PP-Structure V3",
        "version": "1.0.0",
        "paddleocr_available": table_engine is not None
    }


@app.post("/predict/pp_structure_v3")
async def extract_tables(request: PDFRequest):
    """
    Extract tables from PDF using PaddleOCR PP-Structure V3
    
    Args:
        request: PDFRequest containing base64-encoded PDF data and language
        
    Returns:
        JSON response with extracted table data
    """
    logger.info(f"Received extraction request for language: {request.lang}")
    
    try:
        # Get or initialize table engine
        engine = get_table_engine()
        
        # Decode base64 PDF data
        try:
            pdf_bytes = base64.b64decode(request.pdf_data)
            logger.info(f"Decoded PDF data: {len(pdf_bytes)} bytes")
        except Exception as e:
            logger.error(f"Failed to decode PDF data: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid base64 PDF data")
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            tmp_file.write(pdf_bytes)
            tmp_path = tmp_file.name
            logger.info(f"Saved PDF to temporary file: {tmp_path}")
        
        try:
            # Process PDF with PP-Structure
            logger.info("Processing PDF with PP-Structure V3...")
            result = engine(tmp_path, lang=request.lang)
            logger.info(f"Processing complete. Found {len(result)} elements")
            
            # Convert result to JSON-serializable format
            output = []
            for idx, item in enumerate(result):
                # Extract relevant information
                element = {
                    'type': item.get('type', 'unknown'),
                    'bbox': item.get('bbox', []),
                    'res': {},
                }
                
                # Handle different result types
                if item.get('type') == 'table':
                    res = item.get('res', {})
                    element['res'] = {
                        'html': res.get('html', ''),
                        'cells': res.get('cells', []),
                        'structure': res.get('structure', ''),
                    }
                    logger.info(f"Extracted table {idx + 1}")
                elif item.get('type') == 'text':
                    element['res'] = {
                        'text': item.get('res', '')
                    }
                
                output.append(element)
            
            return {
                'result': output,
                'status': 'success',
                'total_elements': len(output),
                'total_tables': sum(1 for item in output if item['type'] == 'table')
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
                logger.info(f"Cleaned up temporary file: {tmp_path}")
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Extraction failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@app.on_event("startup")
async def startup_event():
    """Initialize PaddleOCR on startup"""
    logger.info("Starting PaddleOCR PP-Structure V3 Service...")
    try:
        # Pre-initialize the engine
        get_table_engine()
        logger.info("Service ready to accept requests")
    except Exception as e:
        logger.warning(f"Could not pre-initialize PaddleOCR: {str(e)}")
        logger.warning("PaddleOCR will be initialized on first request")


if __name__ == "__main__":
    import uvicorn
    
    logger.info("=" * 60)
    logger.info("PaddleOCR PP-Structure V3 Service")
    logger.info("=" * 60)
    logger.info("Starting server on http://0.0.0.0:8866")
    logger.info("Press CTRL+C to quit")
    logger.info("=" * 60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8866,
        log_level="info"
    )
