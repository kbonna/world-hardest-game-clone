import React from "react";
import * as styles from "./Footer.module.scss";

const Footer = ({ className }) => {
  const yearNow = new Date().getFullYear();
  return (
    <footer className={`${className} ${styles.Footer}`}>
      <span>
        {yearNow} | Created by © <a href="https://kbonna.com">Kamil Bonna</a>
      </span>
    </footer>
  );
};

export default Footer;
