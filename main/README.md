# Global Cybersecurity Threats (2015-2024)
Anastasiia Morozova, Alexander Hampel

This project is a web-based application for visualizing cybersecurity-related datasets using interactive D3-based diagrams. It is built with **Next.js**, **TypeScript**, and **D3.js**, and organized in a modular and maintainable structure.

# Getting Started

On first run, go to the main folder and use this command to install dependencies:
```bash
npm install
```
Then run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

If you want to add changes, you can edit the page by modifying `app/page.tsx`. This is the entry point of application.

# Dataset
[Global Cybersecurity Threats (2015-2024)](https://www.kaggle.com/datasets/atharvasoundankar/global-cybersecurity-threats-2015-2024) from Kaggle


# Visualizations Overview

## 1. Financial Loss Treemap Visualization

This visualization displays global financial losses caused by cybersecurity attacks over time, using an interactive treemap.

### Functionality  
- **Slider Input**  
  A horizontal slider at the top allows selection of a year between 2015 and 2023.

- **Dynamic Updates**  
  As the slider is adjusted, the treemap updates in real time to reflect losses accumulated up to the selected year.

- **Value Display**  
  A label above the chart shows the total global loss in millions of dollars for the selected year.  
  For example, the value `14,510` in 2015 indicates $14.51 billion lost globally by that year.

### Data Representation  
- **Treemap Blocks**  
  Each block represents a country.

- **Block Size**  
  The area of each block is proportional to the cumulative loss for that country from 2015 through the selected year.

- **Block Color**  
  The color of each block corresponds to the region the country belongs to: Europe, Americas, Asia & Oceania.
  Countries from the same region share similar color tones to support visual grouping.

This visualization provides a clear overview of the growth in cybersecurity-related financial losses over time and highlights which countries have been most affected.

---

## 2. Hierarchical Bar Chart Visualization

### Overview  
This visualization is a three-level bar chart that enables interactive exploration of cyberattack patterns, from the country level down to individual industries.
Clicking on each bar on each level brings user to the deeper layer. Users can navigate back to the previous level by clicking the background area.

### Interaction Levels

#### Level 1: Attacks by Country  
Displays a horizontal bar chart showing the total number of cyberattacks per country. Clicking on a country transitions to the next level.

#### Level 2: Attacks by Type  
Shows a breakdown of cyberattack types within the selected country. Clicking on an attack type reveals the affected industries.

#### Level 3: Targeted Industries  
Displays the industries most affected by the selected attack type in the selected country. This is the last level.

### Purpose  
This hierarchical bar chart offers an intuitive and flexible way to analyze the dataset.  
It allows users to filter the data interactively, identify patterns, and gain detailed insights across multiple dimensions: geography, attack type, and industry sector.

--- 

## 3. Selection Pie Chart Visualization

This visualization displays the selected column of the original data, using an interactive pie chart.

### Functionality  
- **2 Selectors**  
  With the upper selector you can choose the column of the original data, with the lower selector which calculated value represents the size of the pie slice

- **Selections**
  Each slice serves as a selection. When you click on it, the existing data is filtered and made available for the next selection.

- **Showing raw Data**
  The button below the diagram switches between diagram view and table view. All data used to display the diagram is displayed in the table view. 
  The table view also appears after three selections in the diagram.

- **Dynamic Updates**  
  As soon as the selector are changed, the diagram is also automatically updated. 

- **Value Display**  
  If you move the mouse over the slices, a tooltip window appears in which the calculated values for this pie slice are displayed.

### Data Representation  
- **Pie Slices**  
  Each pie slice represents a part of its data depending on the selection, e.g. a country in the Countries column.
  The columns "Financial Loss (in Million $)", "Number of Affected Users" and "Incident Resolution Time (in Hours)" are divided into 5 pie slices with a range depending on the total data.

- **Slice Size**  
  The size of the slice and its sorting depends on the selection of the lower selection.

This visualization is intended to give the user the opportunity to decide on the view and selection of the data.

---

# Inspiration Code
[Bar Chart](https://observablehq.com/@d3/hierarchical-bar-chart)

[Tree Map](https://observablehq.com/@d3/treemap/2)

[Donut](https://codepen.io/ademps/pen/MWKXXN)

# Project Structure

### Root Directory

**`README.md`** - Main project documentation 

**`tsconfig.json`** - TypeScript configuration  

**`package.json` / `package-lock.json`** - Project dependencies and metadata  

**`eslint.config.mjs` / `postcss.config.mjs`** – Linting and CSS post-processing configs 

**`/app/`** - Implements the main application using the Next.js App Router architecture.
- **`layout.tsx`** – Defines global layout and metadata  
- **`page.tsx`** – Home page of the application  
- **`globals.css`** – Global CSS styles  
- **`page.module.css`** – Page-specific scoped CSS module

**`/public/data/`** - Contains all static datasets used in visualizations. These files are loaded on the client side via D3.

- **`Global_Cybersecurity_Threats_2015-2024.csv`** – Main file with aggregated statistics on global threats
- **`census-regions.csv`** – Mapping of states to regions  
- **`financial_losses_2015_2024.tsv`** – Reformated main file to be used in treemap (shows yearly financial loss data due to cyberattacks)
- **`cyber_threats.json`** – Reformated main file to be used in barchart (shows hierarchical threat classification data) 

**`/src/`** - Stores source code for all components, that are used for visualisation. Each modules contains visualization logic in `.tsx` files

