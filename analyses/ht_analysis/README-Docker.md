### Running the Horizontal Transfer (HT) Analysis Workflow in Docker

The HT analysis in AAV-Atlas investigates recombination-driven horizontal transfer of *cap* genes across divergent *rep* lineages. The analysis is defined entirely within the GLUE project and executed by running a single script, provided the project files are accessible inside the Docker container.

#### Step 1: Mount the AAV-Atlas directory when starting the GLUE container

If your local clone of the AAV-Atlas repository is in `/home/fred/AAV-Atlas`, run:

```
docker run --rm -it \\
  --name gluetools \\
  --volume /home/fred/AAV-Atlas:/opt/aav \\
  --workdir /opt/aav \\
  --link gluetools-mysql \\
  cvrbioinformatics/gluetools:latest
```

This mounts the local `AAV-Atlas` directory into the container as `/opt/aav`, allowing the analysis files to be accessed and executed.

#### Step 2: Start the AAV-Atlas project in the GLUE shell

Once inside the container:

```
GLUE> project aav
```

This opens the AAV-Atlas project, which includes the full HT analysis pipeline and data.

#### Step 3: Run the HT analysis script

To execute the full horizontal transfer analysis:

```
GLUE> run file glue/analysis/ht_analysis/aavHtAnalysis.glue
```

This script will:

-   Import additional sequences and metadata

-   Compose alignments for different taxon and coverage sets

-   Reconstruct phylogenies for *rep* and *cap* genes

-   Apply midpoint and outgroup-based rooting

-   Export annotation files for tree visualization

> [!NOTE]\
> You can review and edit the steps executed by this script in the file `glue/analysis/ht_analysis/aavHtAnalysis.glue`.

#### Step 4: Visualize and interpret the results

After the script completes, rerooted trees and annotations will be available under:

```
analyses/ht_analysis/trees/
```

You can open the resulting trees in **[FigTree](https://github.com/rambaut/figtree/)** or any other Newick-compatible viewer. To enrich your tree with contextual metadata (e.g., taxon, group, host), use **FigTree's `Import Annotations`** feature.

> 🔎 Make sure to import the **annotation file that matches the alignment** used to construct the tree.\
> For example, for trees built from the `AL_AAV_HT_ANALYSIS_AllTaxa_AvAavOutgrp` alignment, use:\
> `aavHtPhylogeniesAllTaxaAvAavOutgrp.annotations.tsv`

This will enable color-coding, labeling, and clade inspection based on host species, serotype, and other variables relevant to the horizontal transfer analysis.
