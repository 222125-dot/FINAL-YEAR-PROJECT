"""
Reports Routes — PostgreSQL version
GET    /api/reports/
GET    /api/reports/{scan_id}
DELETE /api/reports/{scan_id}
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db, Report
from routes.auth import get_current_user, User

router = APIRouter()


def report_dict(r: Report) -> dict:
    return {
        "id": r.id, "scan_id": r.scan_id, "organ": r.organ,
        "patient_id": r.patient_id,
        "date": r.date.isoformat() if r.date else "",
        "detections": r.detections or [],
        "total_found": r.total_found,
        "overall_severity": r.overall_severity,
        "confidence": r.confidence,
        "analysis_time": r.analysis_time,
        "model_3d_url": r.model_3d_url,
        "recommendations": r.recommendations or [],
        # Provide an organ icon for frontend display (not stored separately)
        "organ_icon": "🫁",
    }


@router.get("/")
def list_reports(
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db)
):
    reports = (
        db.query(Report)
        .filter(Report.username == current_user.username)
        .order_by(Report.date.desc())
        .all()
    )
    return [report_dict(r) for r in reports]


@router.get("/{scan_id}")
def get_report(
    scan_id:      str,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db)
):
    r = db.query(Report).filter(
        Report.scan_id == scan_id,
        Report.username == current_user.username
    ).first()
    if not r:
        raise HTTPException(404, "Report not found")
    return report_dict(r)


@router.delete("/{scan_id}")
def delete_report(
    scan_id:      str,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db)
):
    r = db.query(Report).filter(
        Report.scan_id == scan_id,
        Report.username == current_user.username
    ).first()
    if not r:
        raise HTTPException(404, "Report not found")
    db.delete(r)
    db.commit()
    return {"message": "Deleted"}
