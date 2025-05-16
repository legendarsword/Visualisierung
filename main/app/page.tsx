import Image from "next/image";
import styles from "./page.module.css";
import { Barchart } from "@/src/barchart/Barchart";
import { FinancialMap } from "@/src/financial-map/FinancialMap";


export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.main_title}>Global Cybersecurity Threats <br/> 2015-2024 </h1>

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
    </main>
  );
}
