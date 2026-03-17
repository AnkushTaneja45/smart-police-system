// One-time script to clear FIRs+Complaints and reseed with 13 demo FIRs
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'smartpolice.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) { console.error('DB error:', err); process.exit(1); }
    console.log('Connected:', dbPath);
});

db.serialize(() => {
    db.run('DELETE FROM FIRs', [], (e) => e && console.error('Del FIRs:', e.message));
    db.run('DELETE FROM Complaints', [], (e) => e && console.error('Del Complaints:', e.message));
    db.run("DELETE FROM sqlite_sequence WHERE name = 'FIRs'");
    db.run("DELETE FROM sqlite_sequence WHERE name = 'Complaints'");

    // 1. Vehicle Theft
    db.run("INSERT INTO Complaints(ComplainantName,ComplainantMobile,Address,IncidentGPS,IncidentDateTime,Description,Status) VALUES('Mohit Garg','9812345670','H.No 45, Sector 12, Ambala','30.3753,76.7821',datetime('now','-25 days'),'My Honda Activa (HR01AB1234) was stolen from outside Sector 12 market at approx 11 PM. No key found, vehicle forcibly taken.','ConvertedToFIR')");
    db.run("INSERT INTO FIRs(ComplaintID,AssignedIO,SectionsApplied,Status,ChargesheetDeadline,CreatedAt) VALUES(1,2,'BNS 303(2), MV Act 379','Under Investigation',date('now','+5 days'),datetime('now','-25 days'))");

    // 2. NDPS Act
    db.run("INSERT INTO Complaints(ComplainantName,ComplainantMobile,Address,IncidentGPS,IncidentDateTime,Description,Status) VALUES('Constable Jagdish Rao','9988776655','Near Bypass Chowk, NH-1, Ambala','30.3800,76.7755',datetime('now','-20 days'),'During naka checking at NH-1 bypass, accused Raju @ Raja found in possession of 1.2 kg Smack (Heroin). Accused arrested on spot.','ConvertedToFIR')");
    db.run("INSERT INTO FIRs(ComplaintID,AssignedIO,SectionsApplied,Status,ChargesheetDeadline,CreatedAt) VALUES(2,2,'NDPS Act Sec 21(c), 29','Under Investigation',date('now','+10 days'),datetime('now','-20 days'))");

    // 3. POCSO Act
    db.run("INSERT INTO Complaints(ComplainantName,ComplainantMobile,Address,IncidentGPS,IncidentDateTime,Description,Status) VALUES('Sushila Devi (Mother)','9812300001','Village Fatehpur, Teh. Naraingarh, Ambala','30.4100,76.8100',datetime('now','-18 days'),'Complainant states her 9-year-old daughter was sexually assaulted by neighbour Ramkumar (45) on 26-Feb-2026. Victim produced before SJPU and doctor.','ConvertedToFIR')");
    db.run("INSERT INTO FIRs(ComplaintID,AssignedIO,SectionsApplied,Status,ChargesheetDeadline,CreatedAt) VALUES(3,4,'POCSO Act Sec 6, BNS 64','Under Investigation',date('now','+12 days'),datetime('now','-18 days'))");

    // 4. Dowry Demand
    db.run("INSERT INTO Complaints(ComplainantName,ComplainantMobile,Address,IncidentGPS,IncidentDateTime,Description,Status) VALUES('Neha Rani','9876501234','H.No 88, Mohalla Ram Nagar, Ambala City','30.3790,76.7810',datetime('now','-15 days'),'Complainant states her in-laws and husband have been demanding Rs 5 lakh cash and a car as dowry. She was beaten and thrown out of her matrimonial home on 12-Mar-2026.','ConvertedToFIR')");
    db.run("INSERT INTO FIRs(ComplaintID,AssignedIO,SectionsApplied,Status,ChargesheetDeadline,CreatedAt) VALUES(4,4,'BNS 84, 85, Dowry Prohibition Act Sec 3, 4','Under Investigation',date('now','+15 days'),datetime('now','-15 days'))");

    // 5. Rape
    db.run("INSERT INTO Complaints(ComplainantName,ComplainantMobile,Address,IncidentGPS,IncidentDateTime,Description,Status) VALUES('Kamla Devi (Victim)','9812399987','Village Jandli, Ambala Cantt','30.3660,76.8400',datetime('now','-12 days'),'Victim (22F) states she was lured by accused Rohit Kumar on pretext of marriage and raped at his Panchkula flat on 01-Mar-2026. Accused absconding. MLC conducted at Civil Hospital.','ConvertedToFIR')");
    db.run("INSERT INTO FIRs(ComplaintID,AssignedIO,SectionsApplied,Status,ChargesheetDeadline,CreatedAt) VALUES(5,4,'BNS 64(1), 65','Under Investigation',date('now','+18 days'),datetime('now','-12 days'))");

    // 6. Gambling Act
    db.run("INSERT INTO Complaints(ComplainantName,ComplainantMobile,Address,IncidentGPS,IncidentDateTime,Description,Status) VALUES('SI Naresh Dhull','9988001122','Dera Baba Nand Singh, Baldev Nagar, Ambala','30.3900,76.7900',datetime('now','-10 days'),'On specific information, SI Naresh Dhull raided the above place and caught 8 persons engaged in gambling (Flush/Teen Patti). Cash Rs 42,500 and cards recovered.','ConvertedToFIR')");
    db.run("INSERT INTO FIRs(ComplaintID,AssignedIO,SectionsApplied,Status,ChargesheetDeadline,CreatedAt) VALUES(6,2,'Punjab Gambling Act Sec 3, 13','Chargesheeted',date('now','-2 days'),datetime('now','-10 days'))");

    // 7. Murder
    db.run("INSERT INTO Complaints(ComplainantName,ComplainantMobile,Address,IncidentGPS,IncidentDateTime,Description,Status) VALUES('Karamvir Singh (Brother)','9812455678','Village Mullana, Ambala','30.3510,76.7580',datetime('now','-8 days'),'Complainant states his brother Balvir Singh (35) was shot dead by Sukhchain and his associates over a land dispute near tubewell at their village on 09-Mar-2026. Body sent for PM.','ConvertedToFIR')");
    db.run("INSERT INTO FIRs(ComplaintID,AssignedIO,SectionsApplied,Status,ChargesheetDeadline,CreatedAt) VALUES(7,2,'BNS 103(1), 109, Arms Act 25','Under Investigation',date('now','+22 days'),datetime('now','-8 days'))");

    // 8. Cyber Crime
    db.run("INSERT INTO Complaints(ComplainantName,ComplainantMobile,Address,IncidentGPS,IncidentDateTime,Description,Status) VALUES('Ashok Mehra','9876509876','Flat 203, Swastik Apartments, Ambala City','30.3760,76.7760',datetime('now','-7 days'),'Complainant received a WhatsApp call from +91-98765XXXXX posing as SBI bank official and was instructed to share OTP. Amount of Rs 1,85,000 debited from his account fraudulently.','ConvertedToFIR')");
    db.run("INSERT INTO FIRs(ComplaintID,AssignedIO,SectionsApplied,Status,ChargesheetDeadline,CreatedAt) VALUES(8,4,'IT Act Sec 66C, 66D, BNS 318(4)','Under Investigation',date('now','+23 days'),datetime('now','-7 days'))");

    // 9. Snatching
    db.run("INSERT INTO Complaints(ComplainantName,ComplainantMobile,Address,IncidentGPS,IncidentDateTime,Description,Status) VALUES('Priya Sharma','9876543099','Near Model Town Chowk, Ambala City','30.3820,76.7830',datetime('now','-5 days'),'Complainant states two youths on a black motorcycle (without number plate) snatched her gold chain and handbag containing mobile phone (Samsung S23) and cash Rs 8,000 near Model Town Chowk.','ConvertedToFIR')");
    db.run("INSERT INTO FIRs(ComplaintID,AssignedIO,SectionsApplied,Status,ChargesheetDeadline,CreatedAt) VALUES(9,2,'BNS 304(2), 305(a)','Under Investigation',date('now','+25 days'),datetime('now','-5 days'))");

    // 10. Burglary
    db.run("INSERT INTO Complaints(ComplainantName,ComplainantMobile,Address,IncidentGPS,IncidentDateTime,Description,Status) VALUES('Harpreet Kaur','9876544321','H.No 12, New Housing Board Colony, Ambala','30.3750,76.7750',datetime('now','-4 days'),'Complainant states unknown persons broke the lock of her house during night and decamped with gold jewellery worth Rs 2.5 Lakh, laptop and cash Rs 15,000 while the family was at a wedding.','ConvertedToFIR')");
    db.run("INSERT INTO FIRs(ComplaintID,AssignedIO,SectionsApplied,Status,ChargesheetDeadline,CreatedAt) VALUES(10,4,'BNS 305(a), 331(4)','Under Investigation',date('now','+26 days'),datetime('now','-4 days'))");

    // 11. Excise Act
    db.run("INSERT INTO Complaints(ComplainantName,ComplainantMobile,Address,IncidentGPS,IncidentDateTime,Description,Status) VALUES('ASI Balwant Singh','9812300099','VPO Shahzadpur, Teh. Naraingarh, Ambala','30.4200,76.8250',datetime('now','-3 days'),'During patrol, ASI Balwant Singh and team found accused Madan (55) in possession of 85 bottles of illicitly distilled liquor (Desi Sharab) being transported on a hand cart. Accused and contraband seized.','ConvertedToFIR')");
    db.run("INSERT INTO FIRs(ComplaintID,AssignedIO,SectionsApplied,Status,ChargesheetDeadline,CreatedAt) VALUES(11,2,'Excise Act Sec 61(1)(a), 61(2)','Chargesheeted',date('now','+1 days'),datetime('now','-3 days'))");

    // 12. Arms Act
    db.run("INSERT INTO Complaints(ComplainantName,ComplainantMobile,Address,IncidentGPS,IncidentDateTime,Description,Status) VALUES('Inspector Rajbir Nain','9812311111','Near Grain Market, Saha, Ambala','30.3451,76.9100',datetime('now','-2 days'),'Acting on a tip-off, Inspector Rajbir Nain apprehended accused Vikram @ Vicky (28) and recovered one illegal country-made pistol (.315 bore) with 3 live cartridges. Accused arrested.','ConvertedToFIR')");
    db.run("INSERT INTO FIRs(ComplaintID,AssignedIO,SectionsApplied,Status,ChargesheetDeadline,CreatedAt) VALUES(12,4,'Arms Act Sec 25, 27, 54, 59','Under Investigation',date('now','+28 days'),datetime('now','-2 days'))");

    // 13. Cheating / Fraud (420)
    db.run("INSERT INTO Complaints(ComplainantName,ComplainantMobile,Address,IncidentGPS,IncidentDateTime,Description,Status) VALUES('Sumit Aggarwal','9812500111','Cloth Market, Ambala City','30.3720,76.7850',datetime('now','-36 hours'),'Complainant states he was cheated of Rs 40 Lakhs by his business partner Ajay Gupta through forged documents and bank shell accounts. Ajay Gupta has fled to Dubai.','ConvertedToFIR')");
    db.run("INSERT INTO FIRs(ComplaintID,AssignedIO,SectionsApplied,Status,ChargesheetDeadline,CreatedAt) VALUES(13,2,'BNS 318(4), 336(3), 340(2)','Under Investigation',date('now','+29 days'),datetime('now','-36 hours'))");

    // 14. Kidnapping
    db.run("INSERT INTO Complaints(ComplainantName,ComplainantMobile,Address,IncidentGPS,IncidentDateTime,Description,Status) VALUES('Rajesh Kumar','9992233445','H.No 121, Sector 9, Ambala City','30.3850,76.7910',datetime('now','-48 hours'),'Complainant reports his 14-year-old son Aryan was kidnapped by unknown persons in a white SUV while returning from tuition. Ransom call for Rs 20 Lakhs received.','ConvertedToFIR')");
    db.run("INSERT INTO FIRs(ComplaintID,AssignedIO,SectionsApplied,Status,ChargesheetDeadline,CreatedAt) VALUES(14,4,'BNS 140(2), 143','Under Investigation',date('now','+28 days'),datetime('now','-48 hours'))");

    // 15. Hurt / Assault (Pending complaint)
    db.run("INSERT INTO Complaints(ComplainantName,ComplainantMobile,Address,IncidentGPS,IncidentDateTime,Description,Status) VALUES('Ranjit Lal','9812399000','VPO Barara, Ambala','30.3320,76.8910',datetime('now','-24 hours'),'Complainant states he was assaulted by his neighbour Ginder Singh and his three sons following a property boundary dispute. Injured with an iron rod; fracture sustained. MLC done at CHC Barara.','Pending')");

    // Seed some documents for FIR #1 to show "Produced" work
    db.run("INSERT INTO Documents (FIRID, DocType, GeneratedData, SignedStatus, SignedBy) VALUES (1, 'Site Visit Report', '{\"observations\": \"Observed forced entry through the secondary gate. Broken glass fragments collected near the parking bay.\"}', 1, 'Suresh Singh')");
    db.run("INSERT INTO Documents (FIRID, DocType, GeneratedData, SignedStatus, SignedBy) VALUES (1, 'Witness Statement', '{\"witnessName\": \"Sumit Kumar\", \"statement\": \"I saw two men wearing black jackets riding a white scooter near the market exit around 11:15 PM.\"}', 1, 'Suresh Singh')");
    db.run("INSERT INTO Documents (FIRID, DocType, GeneratedData, SignedStatus, SignedBy) VALUES (2, 'Seizure Memo', '{\"recoveredItem\": \"1.2kg Smack\", \"location\": \"NH-1 Bypass\"}', 0, NULL)");

    db.get('SELECT COUNT(*) as total FROM FIRs', (e, r) => {
        console.log('FIR count after seed:', r && r.total);
    });
    db.get('SELECT COUNT(*) as total FROM Complaints', (e, r) => {
        console.log('Complaint count after seed:', r && r.total);
        db.close(() => console.log('Done. Restart your backend server.'));
    });
});
