# AAV-Atlas


Welcome to the GitHub repository for **AAV-Atlas**, an atlas of AAV genetic variants!

<img src="md/aav-atlas-logo.png" align="right" alt="" width="250" />

**AAV-Atlas** is a sequence-oriented resource for comparative genomic analysis of adeno-associated viruses (AAVs), developed using the **[GLUE](https://github.com/giffordlabcvr/gluetools)** software framework. 

**AAVs** are small, non-pathogenic DNA viruses widely used in gene therapy due to their tissue-specific targeting, long-term gene expression, and mild immunogenicity. They have enabled groundbreaking treatments for genetic diseases, such as *Luxturna* for inherited retinal disorders, *Zolgensma* for spinal muscular atrophy, and therapies for hemophilia. Despite challenges like limited packaging capacity and immune responses, ongoing advancements in capsid engineering and production methods are enhancing their therapeutic potential.

**GLUE** is an open, integrated software toolkit that provides functionality for storage and interpretation of sequence data. It provides an extensible platform for implementing 'sequence-based resources' that represent the semantic links between sequences and other data items via a relational database. This minimises the requirement for labour-intensive pre-processing of data, and allows sequence-based analyses to be implemented in an efficient, standardised and reproducible way.

AAV-Atlas provides a command line interface (CLI) and can be installed locally, opting either for a **[Docker-based](https://github.com/giffordlabcvr/AAV-Atlas/wiki/Docker-Installation)** or **[native installation](https://github.com/giffordlabcvr/AAV-Atlas/wiki/Native-Installation)**.

Please see the **[User Guide](https://github.com/giffordlabcvr/AAV-Atlas/wiki)** for more details.

* * * * *

## Key Features

- **GLUE Framework Integration**: Built on the GLUE software framework, AAV-Atlas offers an extensible platform for efficient, standardized, and reproducible computational genomic analysis of AAV virus.

- **Phylogenetic Structure**: Sequence data in AAV-Atlas is organized in a phylogenetically-structured manner, allowing users to explore evolutionary relationships comprehensively.

- **Rich Annotations**: Annotated reference sequences enable rigorous comparative genomic analysis related to conservation, adaptation, structural context, and genotype-to-phenotype associations.

- **Automated Genotyping**: Includes functionality for assigning AAV sequences to groups and subgroups using maximum likelihood clade assignment (MLCA).

- **Variant Mapping**: Maps amino acid substitutions across all published AAV sequences, facilitating comparative analysis.


* * * * *

Installation
------------

To install AAV-Atlas, follow the instructions provided in the **[User Guide](https://github.com/giffordlabcvr/AAV-Atlas/wiki)**.

You can choose between:

-   **[Docker-based installation](https://github.com/giffordlabcvr/AAV-Atlas/wiki/Docker-Installation)** for ease of deployment.
-   **[Native installation](https://github.com/giffordlabcvr/AAV-Atlas/wiki/Native-Installation)** for traditional setup.

AAV-Atlas can be installed as a prebuilt database for quick setup or constructed from scratch for more customization.

* * * * *

## Usage

GLUE contains an interactive command line environment focused on the development and use of GLUE projects by bioinformaticians. This provides a range of productivity-oriented features such as automatic command completion, command history and interactive paging through tabular data. 

For detailed instructions on how to use AAV-Atlas for your comparative genomic analysis, refer to the GLUE's [reference documentation](https://github.com/giffordlabcvr/gluetools/wiki/).

* * * * *

##  Reproducible Horizontal Transfer (HT) Analysis

AAV-Atlas includes a fully reproducible analysis pipeline used to investigating horizontal transfer of AAV capsid genes among *rep* lineages. This analysis is located in `analyses/ht_analysis/`

The directory contains:

-   Phylogenetic trees based on different taxon and partition sets
-   Imported EVEs and outgroups
-   Re-rooting strategies and visualisation metadata
-   Orthogonal support from tools like GARD and SplitsTree

For details, see the `ht_analysis/README.md`.


## Directory Structure

The AAV-Atlas project is organized as follows:

```
aav_atlas.sql.gz                    # Compressed SQL database dump (GLUE project)
alignments/                         # Saved alignment files
buildAavAtlas.glue                  # Master script for building AAV-Atlas from source
example/                            # Example input/output files
glue/                               # Core project scripts and source data
  ├── aavBuildCoreProject.glue      # Script: Initialize core schema and data
  ├── aavBuildNuccoreExt.glue       # Script: Import NCBI nuccore sequences
  ├── aavImportSources.glue         # Script: Handle import of sequence sources
  ├── aavModules.glue               # Script: Register module definitions
  ├── aavProjectSettings.glue       # Script: Set general project config
  ├── aavSchemaExtensions.glue      # Script: Define schema extensions
  └── ...                           # Subdirectories contain inputs and logic for specific domains
md/                                 # Markdown documentation files
modules/                            # GLUE module configuration XMLs
  ├── aavMaxLikelihoodGenotyper.xml # MLCA genotyping module config
  ├── ...                           # Additional utility and analysis modules
README.md                           # Main project description and usage instructions
sources/                            # Raw input sequence data (e.g. GenBank FASTA)
tabular/                            # Tabular metadata / side-data
trees/                              # Stored phylogenetic tree files
```

* * * * *

## Data Sources

AAV-Atlas is constructed using public data obtained from the [NCBI Nucleotide](https://www.ncbi.nlm.nih.gov/nuccore) database.

* * * * *

## Contributing

We welcome contributions from the community! If you're interested in contributing to AAV-Atlas, please review our [Contribution Guidelines](./md/CONTRIBUTING.md).

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](./md/code_of_conduct.md)

* * * * *

## License

The project is licensed under the [GNU Affero General Public License v. 3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)

* * * * *

## Contact

For questions, issues, or feedback, please open an issue on the [GitHub repository](https://github.com/giffordlabcvr/AAV-Atlas/issues).

For collaboration please contact **[Dr Robert Gifford](mailto:robjgiff@gmail.com)**.


* * * * *
