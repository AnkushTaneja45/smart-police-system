-- ==============================================================================
-- SMART POLICE SYSTEM MVP - POSTGRESQL SCHEMA SPECIFICATION
-- ==============================================================================

-- 1. STATIONS & DEPARTMENTS
CREATE TABLE PoliceStations (
    StationID SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    District VARCHAR(255) NOT NULL,
    LocationGPS_Lat DECIMAL(10, 8),
    LocationGPS_Lng DECIMAL(11, 8),
    ContactNumber VARCHAR(20)
);

-- 2. PERSONNEL & ROLE BASED ACCESS
CREATE TABLE Officers (
    OfficerID VARCHAR(50) PRIMARY KEY, -- e.g., 'HR-POL-1092'
    Name VARCHAR(255) NOT NULL,
    Rank VARCHAR(100) NOT NULL, -- 'Beat Officer', 'Investigating Officer', 'SHO', 'DSP'
    StationID INT REFERENCES PoliceStations(StationID),
    Mobile VARCHAR(20) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. INITIAL COMPLAINTS (Pre-FIR)
CREATE TABLE Complaints (
    ComplaintID SERIAL PRIMARY KEY,
    ComplainantName VARCHAR(255) NOT NULL,
    ComplainantMobile VARCHAR(20),
    ComplainantAddress TEXT,
    IncidentDateTime TIMESTAMP,
    IncidentGPS_Lat DECIMAL(10, 8),
    IncidentGPS_Lng DECIMAL(11, 8),
    Description TEXT NOT NULL,
    IncidentType VARCHAR(100), -- 'Theft', 'Assault', 'Missing Person'
    Status VARCHAR(50) DEFAULT 'Pending Review', -- 'Pending Review', 'Converted to FIR', 'Dismissed'
    RecordedByOfficer VARCHAR(50) REFERENCES Officers(OfficerID),
    StationID INT REFERENCES PoliceStations(StationID),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. FIRST INFORMATION REPORTS (FIRs) & INVESTIGATIONS
CREATE TABLE FIRs (
    FIRID SERIAL PRIMARY KEY,
    FIRNumber VARCHAR(100) UNIQUE NOT NULL, -- e.g., '102/2026'
    ComplaintID INT UNIQUE REFERENCES Complaints(ComplaintID),
    AssignedIO VARCHAR(50) REFERENCES Officers(OfficerID),
    StationID INT REFERENCES PoliceStations(StationID),
    SectionsApplied VARCHAR(255), -- e.g., 'BNS 303(2), BNS 281'
    Status VARCHAR(50) DEFAULT 'Under Investigation',
    ChargesheetDeadline TIMESTAMP,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. DIGITAL EVIDENCE LOCKER (Media stored in AWS S3 or Local Blobs)
CREATE TABLE Evidence (
    EvidenceID SERIAL PRIMARY KEY,
    FIRID INT REFERENCES FIRs(FIRID) ON DELETE CASCADE,
    UploadedBy VARCHAR(50) REFERENCES Officers(OfficerID),
    Type VARCHAR(50), -- 'Image', 'Video', 'Audio', 'Document'
    FileUrl TEXT NOT NULL, -- S3 Bucket URL
    FileName VARCHAR(255),
    FileSize INT, -- In Bytes
    S3HashKey VARCHAR(255) NOT NULL, -- For chain of custody / tamper evidence
    Description TEXT,
    UploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. DYNAMIC CASE DOCUMENTS (Generated Memos, Notices, Challans)
CREATE TABLE Documents (
    DocID SERIAL PRIMARY KEY,
    FIRID INT REFERENCES FIRs(FIRID) ON DELETE CASCADE,
    GeneratedBy VARCHAR(50) REFERENCES Officers(OfficerID),
    DocType VARCHAR(100), -- 'Arrest Memo', 'Seizure Report', 'Section 50 Notice'
    ContentJSON JSONB, -- Storing dynamic filled fields
    PdfUrl TEXT, -- Final rendered PDF
    SignedStatus BOOLEAN DEFAULT FALSE,
    SignedBy VARCHAR(50), -- Could be Officer ID or Suspect Aadhaar signature reference
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. SUSPECTS & ACCUSED
CREATE TABLE Accused (
    AccusedID SERIAL PRIMARY KEY,
    FIRID INT REFERENCES FIRs(FIRID) ON DELETE CASCADE,
    Name VARCHAR(255) NOT NULL,
    Alias VARCHAR(255),
    Mobile VARCHAR(20),
    Address TEXT,
    Status VARCHAR(50) DEFAULT 'Identified', -- 'Identified', 'Arrested', 'Absconding', 'Bailed'
    RiskLevel VARCHAR(50) DEFAULT 'Unknown',
    CctnsProfileID VARCHAR(100) -- Link to central database
);

-- 8. WITNESSES & TESTIMONIES
CREATE TABLE Witnesses (
    WitnessID SERIAL PRIMARY KEY,
    FIRID INT REFERENCES FIRs(FIRID) ON DELETE CASCADE,
    Name VARCHAR(255) NOT NULL,
    Mobile VARCHAR(20),
    Address TEXT,
    StatementAudioUrl TEXT,
    StatementTranscribedText TEXT,
    RecordedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_fir_status ON FIRs(Status);
CREATE INDEX idx_complaint_status ON Complaints(Status);
CREATE INDEX idx_officer_station ON Officers(StationID);
CREATE INDEX idx_accused_mobile ON Accused(Mobile);
