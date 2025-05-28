"use client";
import React from "react";
import styles from "./page.module.css";
import { Barchart } from "@/src/barchart/Barchart";
import { FinancialMap } from "@/src/financial-map/FinancialMap";
import { WavyBackground } from "@/src/components/ui/wavy-background";
import { Donut } from "@/src/donut/Donut";


export default function Home() {
  return (
    <main className={styles.main}>
      <WavyBackground className="max-w-4xl mx-auto pb-40" backgroundFill="hsl(206, 4%, 4%)">
        <p className="text-2xl md:text-4xl lg:text-7xl text-white font-bold inter-var text-center">
        Global Cybersecurity Threats <br/> 2015-2024
        </p>
      </WavyBackground>

      <section className={styles.finantial_loss} id="finantial_loss">
        <div className={styles.container}>
          <div className={styles.finantial_loss__header}>
            <h1 className={styles.finantial_loss__title}>Finantial Loss by Year</h1>
            <label className={styles.finantial_loss__label} id="yearLabel"></label>
            <FinancialMap/>
          </div>
        </div>
      </section>

      <section className={styles.barchart_attaks} id="barchart_attaks">
        <div className={styles.container}>
          <div className={styles.barchart_attaks__header}>
            <h1 className={styles.barchart_attaks__title}>Attacks by Country</h1>
            <Barchart/>
          </div>
        </div>
      </section>

      <section id="donut_attaks">
        <div className={styles.container}>
          <div className={styles.barchart_attaks__header}>
            <h1 className={styles.barchart_attaks__title}>Donut Chart</h1>
              <div id="selector-container" className="selector-container">
                <div className="selector-group">
                    <p className="height: 1%; display: block;">Chosen Category:</p>
                    <select type="select" name="categorySelector" id="categorySelector">
                        category
                    </select>
                    <p style="height: 1%; display: block;">Chosen Dataview:</p>
                    <select type="select" name="sortSelector" id="sortSelector">
                        sort
                    </select>
                </div>
            </div>
            <div id="graph-container" className="graph-container"></div>
            <div id="switchButton-div" className="switchButton-div">
                <button type="button" id="switchButton"></button>
            </div>
            <div id="data-container" className="data-container"></div>
              <Donut/>
          </div>
        </div>
      </section>
    </main>
  );
}
