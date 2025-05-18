# Alignment Partition Selectors for Horizontal Transfer Analysis

This directory contains `alignmentColumnsSelector` module configurations used to define conserved regions in the Rep78 and VP1 proteins for phylogenetic analysis of AAV and dependoparvovirus sequences. These partition selectors were curated by expert visual inspection in Se-Al, guided by protein conservation and indel-free regions across full-length coding sequences, constrained to the AAV2 reference genome.

These modules are installed in the GLUE project under the `/modules` path but mirrored here to make their role in the `ht_analysis` component explicit and support standalone reproducibility (e.g., for use with Docker or ANTIVHENOM).

## Directory Structure

- `rep78/aa/` — Amino acid-based partitions of Rep78 (codon-aligned)
- `rep78/nucs/` — Nucleotide-based partitions of Rep78
- `vp1/aa/` — Amino acid-based partitions of VP1 (codon-aligned)
- `vp1/nucs/` — Nucleotide-based partitions of VP1
- `rep78+vp1/aa/` — Combined Rep78 + VP1 amino acid partition
- `rep78+vp1/nucs/` — Combined Rep78 + VP1 nucleotide partition

## Naming Convention

All selector module names follow the pattern:

aavAlignmentColumnsHtAnalysis-<GENE><PARTITIONS><TYPE>.xml


Where:
- `<GENE>` = `Rep78`, `VP1`, or `Rep78+VP1`
- `<PARTITIONS>` = 7-digit binary pattern (1 = included, 0 = excluded), left to right
- `<TYPE>` = `AA` for amino acid selector, `Nuc` for nucleotide selector

### Examples

- `aavAlignmentColumnsHtAnalysis-Rep78_12345_AA.xml`  
  → Includes partitions 1–5 of Rep78, defined on amino acid coordinates.

- `aavAlignmentColumnsHtAnalysis-Vp1_0000067_Nuc.xml`  
  → Includes VP1 partitions 6 and 7, defined on nucleotide coordinates.

- `aavAlignmentColumnsHtAnalysis-Rep78+VP1_all_Nuc.xml`  
  → Includes all defined conserved partitions in both Rep78 and VP1, nucleotide coordinates.

## Usage

These selectors are used in:

- `fastaAlignmentExporter` and `fastaProteinAlignmentExporter` modules to export specific alignment regions.
- RAxML-based tree building pipelines that reconstruct phylogenies from constrained, conserved alignment partitions.
- Orthogonal recombination detection analyses (e.g., SplitsTree, GARD) using full partition sets.

Partition definitions are documented in the Extended Methods and referenced in Supplementary Table S1 (Recombination Inference Summary).

## Notes

- Partition boundaries were determined by visual inspection in Se-Al, based on observed conservation and gap patterns.
- Low indel rate and well-aligned protein motifs were required for inclusion.
- The nucleotide-based selectors use AAV2 genomic coordinates; amino acid selectors use codon positions from `Rep78` and `VP1` coding features.

---

This manifest ensures transparency in how partitions were selected and used, and it provides a central reference point for all phylogeny-related GLUE modules in the horizontal transfer study.

Let me know if you'd like this formatted for inclusion in the GitHub repo or converted to a different format (e.g., PDF or plaintext).
