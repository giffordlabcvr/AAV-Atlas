Horizontal Transfer Analysis in AAV-Atlas
=========================================

This section of AAV-Atlas documents a reproducible analytical workflow investigating the horizontal transmission (HT) of *cap* genes between divergent *rep* lineages in Adeno-Associated Viruses (AAVs). The workflow combines curated multiple sequence alignments, phylogenetic reconstruction, and tree rooting strategies, leveraging the GLUE framework to ensure transparency, flexibility, and reproducibility.

Background and Rationale
------------------------

AAVs are small, non-enveloped DNA viruses whose *rep* and *cap* genes often show incongruent phylogenetic relationships. This observation, supported by historical and experimental context, suggests that recombination events have mediated horizontal transfer of capsid genes between otherwise divergent lineages.

This analysis builds on these observations by:

-   Integrating both reference sequences and endogenous viral elements (EVEs) from mammalian genomes.

-   Using carefully curated alignment partitions representing conserved regions of *Rep78* and *VP1*.

-   Exploring congruence and incongruence in tree topologies across taxa, partitions, and rooting strategies.

Overview of the Reproducible Workflow
-------------------------------------

The complete analysis can be reproduced from within a GLUE project environment by executing a series of scripted steps. Each step is fully modular and tracked within the repository structure.

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
├── aavHtAnalysisSelectorModules.glue      # Defines alignment column selectors
├── aavHtAnalysisModules.glue              # Defines phylogeny/utility modules
├── aavHtAnalysisComposeMsas.glue          # Composes constrained alignments
├── aavHtAnalysisComputePhylogenies.glue   # Builds nucleotide and AA trees
├── aavHtAnalysisPreparePhylogenies.glue   # Reroots trees
├── aavHtAnalysisExportAnnotations.glue    # Exports FigTree-compatible annotations
├── partition-definitions/                 # Selector module XML files
└── trees/                                 # Tree output directory
```

Interpreting the Trees
----------------------

The trees produced by this workflow support key findings reported in the associated manuscript:

-   Capsid phylogenies differ markedly from replicase phylogenies.

-   Several lineages share *cap* sequences with distantly related *rep* backbones, implying horizontal transfer.

-   The inclusion of EVEs enables rooting and lineage tracing beyond currently circulating strains.

Different partitions and rooting strategies provide consistent support for these conclusions, while selective alignment composition avoids artefactual placements of short or divergent sequences.

Extensibility
-------------

This analysis framework can be extended by:

-   Adding new taxa or EVEs

-   Modifying selector modules to explore alternative conserved regions

-   Applying additional recombination or network-based methods (e.g., GARD, SplitsTree)

* * * * *

For a quick start, follow the `README.md` in the `ht_analysis` directory, which includes command-by-command instructions for running the complete workflow.