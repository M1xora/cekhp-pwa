-- ============================================================
-- CekHP Diagnostic Tool — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Requirements: 9.1, 10.3, 10.4, 10.5, 10.6
-- ============================================================

-- ------------------------------------------------------------
-- Table: symptoms
-- ------------------------------------------------------------
CREATE TABLE symptoms (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  category    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: conditions
-- ------------------------------------------------------------
CREATE TABLE conditions (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  description        TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  created_at         TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: rules
-- ------------------------------------------------------------
CREATE TABLE rules (
  id           TEXT PRIMARY KEY,
  condition_id TEXT NOT NULL REFERENCES conditions(id),
  symptom_ids  TEXT[] NOT NULL,   -- array of symptom.id values
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row-Level Security (RLS)
-- ============================================================

ALTER TABLE symptoms   ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules      ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- RLS Policies — symptoms
-- ------------------------------------------------------------

-- Anonymous users: SELECT only
CREATE POLICY "anon_select_symptoms"
  ON symptoms
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated users: INSERT
CREATE POLICY "auth_insert_symptoms"
  ON symptoms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users: UPDATE
CREATE POLICY "auth_update_symptoms"
  ON symptoms
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users: DELETE
CREATE POLICY "auth_delete_symptoms"
  ON symptoms
  FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------------------------
-- RLS Policies — conditions
-- ------------------------------------------------------------

-- Anonymous users: SELECT only
CREATE POLICY "anon_select_conditions"
  ON conditions
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated users: INSERT
CREATE POLICY "auth_insert_conditions"
  ON conditions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users: UPDATE
CREATE POLICY "auth_update_conditions"
  ON conditions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users: DELETE
CREATE POLICY "auth_delete_conditions"
  ON conditions
  FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------------------------
-- RLS Policies — rules
-- ------------------------------------------------------------

-- Anonymous users: SELECT only
CREATE POLICY "anon_select_rules"
  ON rules
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated users: INSERT
CREATE POLICY "auth_insert_rules"
  ON rules
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users: UPDATE
CREATE POLICY "auth_update_rules"
  ON rules
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users: DELETE
CREATE POLICY "auth_delete_rules"
  ON rules
  FOR DELETE
  TO authenticated
  USING (true);
