-- CreateTable
CREATE TABLE "admissions" (
    "admission_id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "doctor_id" INTEGER,
    "ward_id" INTEGER,
    "bed_id" INTEGER,
    "admission_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "discharge_date" TIMESTAMP(6),
    "admission_reason" TEXT,
    "status" VARCHAR(30) DEFAULT 'Admitted',

    CONSTRAINT "admissions_pkey" PRIMARY KEY ("admission_id")
);

-- CreateTable
CREATE TABLE "beds" (
    "bed_id" SERIAL NOT NULL,
    "bed_number" VARCHAR(20) NOT NULL,
    "ward_id" INTEGER,
    "status" VARCHAR(30) DEFAULT 'Available',

    CONSTRAINT "beds_pkey" PRIMARY KEY ("bed_id")
);

-- CreateTable
CREATE TABLE "departments" (
    "department_id" SERIAL NOT NULL,
    "department_name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "doctor_id" SERIAL NOT NULL,
    "doctor_name" VARCHAR(100) NOT NULL,
    "specialization" VARCHAR(100),
    "department_id" INTEGER,
    "phone" VARCHAR(20),
    "email" VARCHAR(150),

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("doctor_id")
);

-- CreateTable
CREATE TABLE "patients" (
    "patient_id" SERIAL NOT NULL,
    "patient_code" VARCHAR(20) NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50),
    "date_of_birth" DATE,
    "gender" VARCHAR(20),
    "phone" VARCHAR(20),
    "address" TEXT,
    "blood_group" VARCHAR(10),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("patient_id")
);

-- CreateTable
CREATE TABLE "wards" (
    "ward_id" SERIAL NOT NULL,
    "ward_name" VARCHAR(100) NOT NULL,
    "ward_type" VARCHAR(50),
    "floor" INTEGER,

    CONSTRAINT "wards_pkey" PRIMARY KEY ("ward_id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "type" VARCHAR(50),
    "category" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(150) NOT NULL,
    "floor" VARCHAR(50),
    "contact_phone" VARCHAR(50),
    "email" VARCHAR(150),
    "opening_hours" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    "accessibility_info" TEXT,
    "is_staff_only" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(50) NOT NULL,
    "department_id" INTEGER,
    "facility_id" INTEGER,
    "location" VARCHAR(150),
    "opening_hours" VARCHAR(100) NOT NULL DEFAULT 'Open 24 hours',
    "status" VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    "contact_phone" VARCHAR(50),
    "is_staff_only" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_patient_code_key" ON "patients"("patient_code");

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "beds"("bed_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("ward_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "beds" ADD CONSTRAINT "beds_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("ward_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("department_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("department_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
