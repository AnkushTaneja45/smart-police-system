-- Initialize Smart Police System Database Schema (PostgreSQL)

-- Table: Officers
CREATE TABLE Officers (
    OfficerID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Rank VARCHAR(50) NOT NULL,
    StationID INTEGER NOT NULL,
    Mobile VARCHAR(15) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Complaints
CREATE TABLE Complaints (
    ComplaintID SERIAL PRIMARY KEY,
    ComplainantName VARCHAR(100) NOT NULL,
    ComplainantMobile VARCHAR(15),
    Address TEXT,
    IncidentGPS VARCHAR(50),
    IncidentDateTime TIMESTAMP,
    Description TEXT NOT NULL,
    AudioURL VARCHAR(255),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(20) DEFAULT 'Pending' -- Pending, ConvertedToFIR, Dismissed
);

-- Table: FIRs
CREATE TABLE FIRs (
    FIRID SERIAL PRIMARY KEY,
    ComplaintID INTEGER UNIQUE REFERENCES Complaints(ComplaintID) ON DELETE SET NULL,
    AssignedIO INTEGER REFERENCES Officers(OfficerID) ON DELETE SET NULL,
    SectionsApplied TEXT,
    Status VARCHAR(50) DEFAULT 'Under Investigation',
    ChargesheetDeadline DATE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Evidence
CREATE TABLE Evidence (
    EvidenceID SERIAL PRIMARY KEY,
    FIRID INTEGER REFERENCES FIRs(FIRID) ON DELETE CASCADE,
    Type VARCHAR(50) NOT NULL, -- Audio, Video, Photo, PDF
    S3_URL VARCHAR(255) NOT NULL,
    HashKey VARCHAR(64) NOT NULL, -- SHA-256 Hash for chain of custody
    Title VARCHAR(100),
    CapturedAt TIMESTAMP,
    CapturedBy INTEGER REFERENCES Officers(OfficerID),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Witnesses
CREATE TABLE Witnesses (
    WitnessID SERIAL PRIMARY KEY,
    FIRID INTEGER REFERENCES FIRs(FIRID) ON DELETE CASCADE,
    Name VARCHAR(100) NOT NULL,
    Mobile VARCHAR(15),
    AudioURL VARCHAR(255),
    TranscribedText TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Accused
CREATE TABLE Accused (
    AccusedID SERIAL PRIMARY KEY,
    FIRID INTEGER REFERENCES FIRs(FIRID) ON DELETE CASCADE,
    Name VARCHAR(100) NOT NULL,
    Mobile VARCHAR(15),
    Address TEXT,
    Status VARCHAR(20) DEFAULT 'Absconding', -- Arrested, Absconding, Out on Bail
    ArrestDate TIMESTAMP,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Documents
CREATE TABLE Documents (
    DocID SERIAL PRIMARY KEY,
    FIRID INTEGER REFERENCES FIRs(FIRID) ON DELETE CASCADE,
    DocType VARCHAR(50) NOT NULL, -- Arrest Memo, Seizure Memo, Section 50 Notice
    S3_URL VARCHAR(255),
    GeneratedData JSONB, -- Stores the JSON payload that generated the document
    SignedStatus BOOLEAN DEFAULT FALSE,
    SignedBy INTEGER REFERENCES Officers(OfficerID),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_officer_station ON Officers(StationID);
CREATE INDEX idx_firs_assignedio ON FIRs(AssignedIO);
CREATE INDEX idx_complaints_mobile ON Complaints(ComplainantMobile);
CREATE INDEX idx_accused_mobile ON Accused(Mobile);
CREATE INDEX idx_evidence_hash ON Evidence(HashKey);

-- Seed data for testing
INSERT INTO Officers (Name, Rank, StationID, Mobile, PasswordHash) VALUES
('Ramesh Kumar', 'Beat Officer', 101, '9876543210', 'hashed_pass_1'),
('Suresh Singh', 'IO', 101, '9876543211', 'hashed_pass_2'),
('Vikas Yadav', 'SHO', 101, '9876543212', 'hashed_pass_3');
