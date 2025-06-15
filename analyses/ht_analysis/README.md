Horizontal Transfer Analysis in AAV-Atlas
=========================================

This section of AAV-Atlas documents a reproducible analytical workflow investigating the horizontal transmission (HT) of *cap* genes between divergent *rep* lineages in Adeno-Associated Viruses (AAVs). The workflow combines curated multiple sequence alignments, phylogenetic reconstruction, and tree rooting strategies, leveraging the GLUE framework to ensure transparency, flexibility, and reproducibility. For details on running this workflow in a containerized environment, see [here](README-Docker.md) for a description of how Docker can be used to simplify installation and support reproducible execution across different systems.

Background and Rationale
------------------------

The *rep* and *cap* genes of AAVs show incongruent phylogenetic relationships.
This observation suggests that recombination events have mediated horizontal transfer of capsid genes between otherwise divergent lineages.

The analysis described below builds on these observations by:

-   Integrating both reference sequences and endogenous viral elements (EVEs) from mammalian genomes.

-   Using carefully curated alignment partitions representing conserved regions of *Rep78* and *VP1*.

-   Exploring congruence and incongruence in tree topologies across taxa, partitions, and rooting strategies.


Directory Contents
------------------

### `glue/analysis/ht_analysis/`

GLUE script files for setting up and executing the analysis:

-   `aavHtAnalysisSelectorModules.glue`: Defines alignment column selector modules for conserved Rep and VP1 partitions.

-   `aavHtAnalysisModules.glue`: Creates modules for tree generation, rerooting, and annotation export.

-   `aavHtAnalysisComposeMsas.glue`: Composes the different taxa-based alignments used in tree construction.

-   `aavHtAnalysisComputePhylogenies.glue`: Computes ML phylogenies for selected nucleotide and amino acid partitions.

-   `aavHtAnalysisPreparePhylogenies.glue`: Applies midpoint or outgroup rooting strategies.

-   `aavHtAnalysisExportAnnotations.glue`: Exports alignment member metadata for tip annotation in FigTree or similar tools.

### `analyses/ht_analysis/export-scripts/`

-   `aavHtAnalysisExportAaPartitions.glue`: Exports amino acid alignments for downstream analysis and visualization.

### `analyses/ht_analysis/orthogonal/`

Supporting recombination and network-based analyses:

-   `GARD/`: Includes output logs from the GARD recombination analysis (`GARD log.txt`).

-   `splits-tree/`: Input and results from SplitsTree analysis of conserved concatenated partitions.

    -   `aav-mintax-maxcoverage.fna`: Concatenated alignment used for network inference.

    -   `aav-mintax-maxcoverage.stree6`: SplitsTree network file.

    -   `splits-tree-result.pdf`, `splits-tree-result.png`: Visual output of the resulting split decomposition network.

### `analyses/ht_analysis/summary-tables/`

-   `rep78+vp1_conserved_partitions.docx`: Table of conserved Rep78 and VP1 partitions used for tree construction.

-   `extended-isolation+assoc.docx`: Metadata summary of taxa included in the analysis, including host information and known associations.

### `analyses/ht_analysis/trees/`

Phylogenetic trees and annotation files:

-   Files follow a consistent naming scheme:

    -   Prefixes: `rep78_`, `vp1_`, etc. denote which gene the tree corresponds to.

    -   Suffixes like `_nucs` or `_amino` specify nucleotide vs. amino acid partition.

    -   Alignment set (e.g., `allTaxa`, `highCapCoverage`) and rooting method (`noOutgrp`, `avianOutgrp`, `MidpointRerooted`, `OutGrpRerooted`) are embedded.

-   `aavHtPhylogenies*.annotations.tsv`: Annotation files providing alignment member metadata for visualizing trees.

-   `*.tree`: Unrooted phylogenies.

-   `*_MidpointRerooted.tree`: Phylogenies rooted using midpoint strategy.

-   `*_OutGrpRerooted.tree`: Phylogenies rooted using an avian AAV outgroup (`AY186198`).

* * * * *

### Running the Analysis

Once AAV-Atlas is installed (either built natively or imported using the `.sql.gz` snapshot provided at the repository root), the complete analysis can be reproduced from within a GLUE project environment by entering a single command:

```
Mode path: /
GLUE> project aav run file glue/analysis/ht_analysis/aavHtAnalysis.glue
```

This will execute all analysis steps, including alignment composition, phylogeny generation, rerooting, and annotation export, as described below.


### 1\. Setup and Data Import

-   Load modules for alignment selectors and tree building.

-   Import additional sequence sources:

    -   EVEs (`fasta-eve-aav`)

    -   Outgroup sequences (`ncbi-refseqs-outgroups`)

-   Load associated taxonomic metadata.

-   Extract GenBank metadata for outgroups.

-   Import the master unconstrained alignment: `AL_UNC_AAV_HT_ANALYSIS`.

### 2\. Composition of Constrained MSAs

Constrained MSAs are created to explore phylogenetic signals under different taxa sets and coverage filters:

-   **Taxa sets**:

    -   `AllTaxa`: All AAVs and EVEs

    -   `HighRepCoverage`: Excludes partial-*rep* sequences

    -   `HighCapCoverage`: Excludes partial-*cap* sequences

-   **Outgroup inclusion**:

    -   Alignments are generated both with and without the avian AAV outgroup (`AY186198`).

All alignments are derived from the unconstrained genome-length MSA using reference-constrained coordinates.

### 3\. Tree Inference

Phylogenetic trees are generated using RAxML for both:

-   **Nucleotide partitions** (from *Rep78* and *VP1*)

-   **Amino acid partitions** (translated from selected *Rep78* and *VP1* codon ranges)

Tree-building scripts specify the alignment, selector module, and output file destination. Partition modules are curated to minimize indels and focus on conserved regions.

### 4\. Rerooting

Trees are rerooted using two strategies:

-   **Midpoint rooting**: Assumes approximately clock-like evolution.

-   **Outgroup rooting**: Uses the avian AAV (`AY186198`) as a rooting taxon.

Each tree is saved both in original and rerooted forms for comparison.

### 5\. Tree Annotation

Alignment-specific annotations (e.g., species, taxon group, EVEs) are exported to support visualization in FigTree or other tools. These are written to TSV files matching each alignment used in tree building.

Repository Structure
--------------------

Key components of the workflow are organized as follows:

```
glue/analysis/ht_analysis/
├── aavHtAnalysisSelectorModules.glue      # Loads alignment column selector modules
├── aavHtAnalysisModules.glue              # Defines phylogeny/utility modules
├── aavHtAnalysisComposeMsas.glue          # Composes constrained alignments
├── aavHtAnalysisComputePhylogenies.glue   # Builds nucleotide and AA trees
├── aavHtAnalysisPreparePhylogenies.glue   # Reroots trees
├── aavHtAnalysisExportAnnotations.glue    # Exports FigTree-compatible annotations

modules/msaColumnSelectors/ht_analysis/    # Alignment column selector definitions
├── rep78/
│   ├── aa/                                # Rep78 amino acid selector XMLs
│   └── nucs/                              # Rep78 nucleotide selector XMLs
├── vp1/
│   ├── aa/                                # VP1 amino acid selector XMLs
│   └── nucs/                              # VP1 nucleotide selector XMLs
└── rep78+vp1/
    ├── aa/                                # Combined Rep78+VP1 amino acid selector
    └── nucs/                              # Combined Rep78+VP1 nucleotide selector

analyses/ht_analysis/
├── README.md                                # Main documentation for the HT analysis
├── README-Docker.md                         # Instructions for running in Docker
│
├── trees/                                   # Phylogenetic tree outputs
│   ├── ancillary/                           # Trees for alternate taxon/partition sets
│   └── *.tree                               # Primary trees from main alignments
│
├── utility-scripts/                         # Utility scripts for exports and QA
│   ├── aavHtAnalysisExportAaPartitions.glue
│   ├── aavHtAnalysisExportNucPartitions.glue
│   └── aavHtAnalysisShowAaConservation.glue
│
├── additional-material/
│   ├── orthogonal/                          # SplitsTree and GARD recombination analyses
│   │   ├── GARD/
│   │   └── splits-tree/
│   │
│   ├── rep-codivergence/
│   │   └── AAV Rep-Host Codivergence.pdf    # Rooted Rep phylogeny figure with EVE support
│   │
│   └── summary-tables/                      # Partition definitions and host metadata
│       ├── table s1+s2 partitions.docx
│       ├── table s3 extended-isolation+assoc.docx
│       ├── rep78-coverage.tsv
│       ├── vp1-coverage.tsv
│       ├── rep-coverage.xlsx
│       └── vp-coverage.xlsx
```

Interpreting the Trees
----------------------

The trees produced by this workflow support key findings reported in the **[associated manuscript](https://www.biorxiv.org/content/10.1101/2025.03.15.643461v4)**:

-   Capsid phylogenies differ markedly from replicase phylogenies.

-   Several lineages share *cap* sequences with distantly related *rep* backbones, implying horizontal transfer.

-   The inclusion of EVEs enables rooting and lineage tracing beyond currently circulating strains.

Different partitions and rooting strategies provide consistent support for these conclusions, while selective alignment composition avoids artefactual placements of short or divergent sequences.

* * * * *

