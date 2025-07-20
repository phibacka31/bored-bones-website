'use client'; // This tells Next.js that this component needs to run in the browser

import { useState } from 'react'; // We need this to make the menu open and close
import Image from 'next/image'; // To use your skull icon image
import Link from 'next/link';   // To create links to other pages
import styles from './DropdownNav.module.css'; // We'll create this CSS file next

export default function DropdownNav() {
  // This is how we keep track of whether the menu is open or closed
  const [isOpen, setIsOpen] = useState(false);

  // This function will toggle the menu open/closed when the icon is clicked
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.dropdownContainer}>
      {/* The skull icon that you click */}
      <button onClick={toggleMenu} className={styles.iconButton}>
        <Image
          src="/images/skull-icon.png" // Path to your skull icon
          alt="Navigation Menu"
          width={40} // Adjust size as needed
          height={40} // Adjust size as needed
        />
      </button>

      {/* The dropdown menu itself, shown only when isOpen is true */}
      {isOpen && (
      <div className={styles.dropdownMenu}>
        {/* Add the Home link here */}
        <Link href="/" onClick={toggleMenu} className={styles.dropdownItem}>
          Home
        </Link>
        {/* Existing links below */}
        <Link href="/lore" onClick={toggleMenu} className={styles.dropdownItem}>
          Book of Lore
        </Link>
        <Link href="/collection" onClick={toggleMenu} className={styles.dropdownItem}>
          Bone Explorer
        </Link>
        <Link href="/mybones" onClick={toggleMenu} className={styles.dropdownItem}>
          My Bones
        </Link>
        <Link href="/bone-arcade" onClick={toggleMenu} className={styles.dropdownItem}>
          Bone Arcade
        </Link>
        <Link href="/anonorder" onClick={toggleMenu} className={styles.dropdownItem}>
          Anon Order
        </Link>
        <Link href="/community" onClick={toggleMenu} className={styles.dropdownItem}>
          Community
        </Link>
        <Link href="/team" onClick={toggleMenu} className={styles.dropdownItem}>
          The Team
        </Link>
      </div>
    )}
    </div>
  );
}