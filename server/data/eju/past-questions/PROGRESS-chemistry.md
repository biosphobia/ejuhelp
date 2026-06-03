# EJU past-question extraction — Chemistry progress

Scope: extract every **Chemistry** question from the EJU science past papers, bilingual
(JA canonical + EN), figures described in text, syllabus-tagged (matter-structure /
states-and-change / inorganic / organic — matching `data/eju/chemistry.json`),
pattern-tagged, answers taken from the official JASSO key and independently re-solved
to verify, with concise worked solutions. Schema mirrors the physics files but the
chemistry section is a **flat 20-item list** (問1–問20, rows 1–20), no Roman-numeral blocks.

Chemistry lives in the SAME combined Science (理科) booklet as physics, roughly pages
理科-23 … 理科-37. The Drive file IDs below are the same booklet/answer PDFs used for physics.

Workflow per paper:
1. Decode the science question PDF → locate the 化学 section (`化学` cover page) → rasterize.
2. Read the 化学 column of the answer 正解表 (rasterized image, not the garbled text export).
3. Solve & verify every item; build `chemistry/<year>-<session>.json`; validate; commit.

## Chemistry papers (question + answer both available)

| Year | Sess | Question fileId | Answer fileId | Status |
|------|------|-----------------|---------------|--------|
| 2021 | 1 | 18zMUZMALKNFNOSsNd2FP-l_BvxMOqdsA | 1CCQ3RloF9lVbnn0gxey8r3g5Oad4Nftx | ⬜ |
| 2020 | 2 | 1C3fgNrOPvXKGLSt_JMdsTfTcdmlqIfgI | 1aNaeDTdMeuGotg0ExquHyAJhOWxXuQ_t | ⬜ |
| 2019 | 1 | 12smUu1_-LP4ylDMBsGB9HQX4L5zt6cC7 | 1CW1ERITvvteo1AVSzz0oF7u02ukUEb39 | ⬜ |
| 2018 | 2 | 1R86sJdI8MFWbe_4i9D8ihabWYyC8DTgm | 1G7DAyFphO1DXvITE2GuiibQZf3_aQjzZ | ⬜ |
| 2018 | 1 | 1BTuCMg1gOO92-Y9TbLeYUfuIYaqQKe5R | 1xXR68ek8xpuk6UM7lMHM4Ge1ThynZ6hV | ⬜ |
| 2017 | 2 | 17L3webIDFY-jfe-xkLgdMmBQiAP3kP4E | 1D3t8Gj29nA-9Z2HKBbABl-2aH5fKLz4N | ⬜ |
| 2016 | 2 | 1QlG19QEC_W0afvi5LdcuWoM9vsttrITu | 1cncvxRQqzHA9OU_IC17EwWDoK3hkMHsC | ✅ done (20) |
| 2016 | 1 | 1cGmZVgdXNCqRGnU9x2xr54fzOuhPvRa6 | 1CY0e8gbHGhSVh8DmDIsyaP0lvoTISuqv | ✅ done (20) |
| 2015 | 2 | 1Noae5OTQ8JTUyupTJ6JL3W7drPHAo9ae | 1u6DnRu1hLtm6XjnfjEAzu9NA3nB1QYIQ | ✅ done (20) |
| 2015 | 1 | 14QePGytcPH1NZUaBzRXiWDC_i3Cr7KWw | 1Tf0cNbE4YDmF2a0dPe2GA7f6qXEs93NU | ✅ done (20) |
| 2014 | 2 | 1UTZM4Ihqcf1S0qHy5vbfh1oj2KN7jq76 | 1gewIFu1nGdZTvPEri5aInlwxtaNRL6vl | ✅ done (20) |
| 2014 | 1 | 1YtyM7BupKbOw1hmsYgzm_TJYw13zXIIZ | 1hTk-KZj7HsVbQJYS2GPCB9qa5Pfh9uLZ | ✅ done (20) |
| 2013 | 2 | 1bSK0C99TvLLfc17uhzqZsn1Opi5XHIXK | 1jCoBfbsz0eqB4qVFKW3e9HgiatdDogHA | ✅ done (20) |
| 2013 | 1 | 1MLDJv1HeE3MqrLSIBgJMJnvy6iCfVxq7 | 1W5AO-n27yHZEVoo-DSkTdKUf21pDMhat | ✅ done (20) |
| 2012 | 2 | 1fLqPOetKW9J3etZDroOKGYXAPDbm8Spe | 1tia15lyR1U-mQcomg-LDGULBkCzywSZW | ✅ done (20) |
| 2012 | 1 | 1UuVPu95A464Syg8LtUZz4drwUmlL3fbt | 1OfoYCM4Tj1-sh8gi5Ujk9uwtfr1NoCzl | ✅ done (20) |
| 2011 | 1 | 1hBjO0w8xkf8B-BTIleHmHF9qohfN5GkL | 18aDbg9WLwaq87V2gtt7GCFlx0yeLU0J5 | ✅ done (20) |
| 2010 | 1 | 10PH9k2akTYBt0hiJc6VNU_jDjUDLDiwH | 1Q60uuxBPo43pxuzsHbOwRPn9le06Y_Qa | ✅ done (20) |

## Gaps (cannot fully verify — held)
- **2011 Session 2**: question present (1Dr8SNNqPhd-AsNyt6xtPqU_6wHiktnGt) but **answer key missing**.
- **2017 Session 1**: answer present (1xD9F_hYjydiY-BQ5yOeu6RF8-AZ62whe) but **question paper missing**.
- No files for 2019-2, 2020-1, 2021-2, or 2022+.

## Notes
- Chemistry section = flat 20 single-best-answer items; constants/atomic-weights box printed each paper.
- Topic ids align with `data/eju/chemistry.json`: `matter-structure`, `states-and-change`, `inorganic`, `organic`. Added to `BLOCK_NAME` in `server/eju.ts` for bilingual block labels.
