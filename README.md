# Twacha Labs: Macroscopic Skin Intelligence for Men 🧬
**Proprietary Hardware-Software Loop for Clinical-Grade Dermatological Diagnostics**

[Website](https://twachalabs.io) | [Case Study](https://medium.com/@ybagri) | [B2B Partnership: Manchester Wellness]

Twacha Labs is moving the men’s personal care market from "guesswork" to a data-driven "maintenance protocol." We have architected a proprietary system that combines smartphone-attached 15x macroscopic optics with agentic computer vision to deliver clinical-grade skin analysis at home.

---

## 🏛️ System Architecture
Twacha Labs is built on the philosophy that **"Dashboards are dead; Agents act."** Our stack is designed for low-latency inference and maximum data integrity.

### 1. The Vision Pipeline (The Eyes)
- **Macro-Optical Normalization:** Custom OpenCV algorithms to calibrate focal depth and lighting variance from 15x macro lens inputs.
- **De-identification Engine:** Automated "Patch" generation (cropping zones of interest) to ensure 100% user privacy and compliance with OpenAI’s Vision Fine-Tuning policies.
- **Fine-Tuning:** Moving from a GPT-4o wrapper to a proprietary **Vision Transformer (ViT)** using **PEFT/LoRA** to detect pore-level pathology.

### 2. Agentic Orchestration (The Brain)
- **Multi-Agent Reasoning:** Built on **LangGraph**, the system utilizes a "Diagnostic-Critique" loop. 
    - *Agent A (Analyst):* Extracts metrics from the vision pipeline.
    - *Agent B (Auditor):* Cross-references metrics against clinical guidelines.
    - *Agent C (Coach):* Formats a high-density, "No-BS" maintenance protocol for the user.
- **Stateful Management:** Using **Supabase Edge Functions** to manage the lifecycle of a skin "journey" rather than a one-time scan.

### 3. The Data Moat (The Multiplier)
- **World-First Dataset:** We are building the largest standardized dataset of **Macroscopic Male Skin**. 
- **Bayesian Updating:** Our model uses Bayesian inference to update a user's "Skin Health Score" as more data points are collected, allowing for true longitudinal tracking.

---

## 🛠️ Tech Stack & MLOps

| Layer | Technology |
| :--- | :--- |
| **Backend** | Supabase (PostgreSQL), Edge Functions (Deno) |
| **Orchestration** | LangGraph, PydanticAI |
| **Inference** | OpenAI GPT-4o (Vision), custom PyTorch LoRA adapters |
| **Security** | Row-Level Security (RLS), AES-256 Encryption, GDPR/HIPAA Compliance |
| **Validation** | DeepEval (Automated Hallucination Unit Testing) |

---

## 📈 Validated Traction & Roadmap
- **Q1 2026 (Current):** MVP Launch. Closed first B2B Pilot with Manchester Wellness Center.
- **Q2 2026:** Launch of the **Twacha Pro Kit** (15x Macro Lens Distribution).

---

## 🛡️ Governance & Clinical Safety
In a high-stakes health environment, "Safety-First" is the architecture, not an afterthought.
- **Human-in-the-Loop (HITL):** Random 5% audit of AI diagnostics by board-certified dermatologists.
- **Faithfulness Metrics:** Every AI recommendation must pass a **DeepEval** check against grounded medical literature stored in our Vector Database (pgvector).
- **Zero-Face Retention:** Our pipeline never stores full-face images. We only retain anonymised, macroscopic skin patches.

---

## 👨‍💻 Developer Notes
This repository contains the core logic for the **Twacha Vision Pre-processor**. 
```bash
# Setup Environment
pip install -r requirements.txt

# Run Macroscopic Normalization Script
python core/processor/normalize_macro.py --input data/samples/raw_pore_shot.jpg
