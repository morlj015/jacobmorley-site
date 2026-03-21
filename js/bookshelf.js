(function () {
  'use strict';

  const GR_PROFILE = 'https://www.goodreads.com/user/show/131682472-jacob-morley';

  // Book data — update by running: node scripts/fetch-books.js
  const BOOKS = [
    { title: "Project Hail Mary", author: "Andy Weir", rating: 5, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1764703833l/54493401.jpg", link: "https://www.goodreads.com/book/show/54493401" },
    { title: "Wuthering Heights", author: "Emily Brontë", rating: 4, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1478641029l/32929156.jpg", link: "https://www.goodreads.com/book/show/32929156" },
    { title: "The Way of the Superior Man", author: "David Deida", rating: 5, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1347751295l/79424.jpg", link: "https://www.goodreads.com/book/show/79424" },
    { title: "Hamnet", author: "Maggie O'Farrell", rating: 4, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1574943819l/43890641.jpg", link: "https://www.goodreads.com/book/show/43890641" },
    { title: "Stoner", author: "John Williams", rating: 4, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1742326950l/166997.jpg", link: "https://www.goodreads.com/book/show/166997" },
    { title: "The Old Man and the Sea", author: "Ernest Hemingway", rating: 4, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1329189714l/2165.jpg", link: "https://www.goodreads.com/book/show/2165" },
    { title: "Dead Simple", author: "Peter James", rating: 3, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1439269103l/703353.jpg", link: "https://www.goodreads.com/book/show/703353" },
    { title: "The Adventures of Huckleberry Finn", author: "Mark Twain", rating: 4, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1546096879l/2956.jpg", link: "https://www.goodreads.com/book/show/2956" },
    { title: "The Diary of a CEO", author: "Steven Bartlett", rating: 3, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1720334665l/199017130.jpg", link: "https://www.goodreads.com/book/show/199017130" },
    { title: "The Pilgrimage", author: "Paulo Coelho", rating: 4, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1390304912l/2759537.jpg", link: "https://www.goodreads.com/book/show/2759537" },
    { title: "The Adventures of Tom Sawyer", author: "Mark Twain", rating: 4, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1404811979l/24583.jpg", link: "https://www.goodreads.com/book/show/24583" },
    { title: "Norwegian Wood", author: "Haruki Murakami", rating: 4, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1713542603l/11297.jpg", link: "https://www.goodreads.com/book/show/11297" },
    { title: "The Bridge Over the River Kwai", author: "Pierre Boulle", rating: 3, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1320532738l/1351174.jpg", link: "https://www.goodreads.com/book/show/1351174" },
    { title: "1984", author: "George Orwell", rating: 4, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1609804984l/56557080.jpg", link: "https://www.goodreads.com/book/show/56557080" },
    { title: "The Remains of the Day", author: "Kazuo Ishiguro", rating: 3, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1327128714l/28921.jpg", link: "https://www.goodreads.com/book/show/28921" },
    { title: "White Nights", author: "Fyodor Dostoyevsky", rating: 3, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1450699039l/1772910.jpg", link: "https://www.goodreads.com/book/show/1772910" },
    { title: "Animal Farm", author: "George Orwell", rating: 4, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1325861570l/170448.jpg", link: "https://www.goodreads.com/book/show/170448" },
    { title: "Atomic Habits", author: "James Clear", rating: 3, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1655988385l/40121378.jpg", link: "https://www.goodreads.com/book/show/40121378" },
    { title: "Klara and the Sun", author: "Kazuo Ishiguro", rating: 4, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1603206535l/54120408.jpg", link: "https://www.goodreads.com/book/show/54120408" },
    { title: "The Fifth Mountain", author: "Paulo Coelho", rating: 4, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1412531400l/1429.jpg", link: "https://www.goodreads.com/book/show/1429" },
    { title: "The Alchemist", author: "Paulo Coelho", rating: 5, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1654371463l/18144590.jpg", link: "https://www.goodreads.com/book/show/18144590" },
    { title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", rating: 0, cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1465761302l/28257707.jpg", link: "https://www.goodreads.com/book/show/28257707" }
  ];

  const grid       = document.getElementById('books-grid');
  const countEl    = document.getElementById('shelf-count');
  const filterBtns = document.querySelectorAll('.shelf-filter__btn');
  let allBooks     = [];

  /* ── Helpers ─────────────────────────────────────────────── */

  function starsHTML(rating) {
    if (!rating || rating < 1) return '<span class="no-rating">not rated</span>';
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += i <= rating ? '★' : '<span class="empty">★</span>';
    }
    return html;
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Render ──────────────────────────────────────────────── */

  function renderBooks(books) {
    if (!books.length) {
      grid.innerHTML = '<p class="shelf-empty">No books match this filter.</p>';
      return;
    }

    grid.innerHTML = books.map(b => {
      const t = escapeHTML(b.title);
      const a = escapeHTML(b.author);

      return `
        <a class="book-card" href="${b.link}" target="_blank" rel="noopener noreferrer"
           tabindex="0" aria-label="${t} by ${a} — ${b.rating ? b.rating + ' stars' : 'unrated'}">
          <div class="book-card__cover">
            <img src="${b.cover}" alt="Cover of ${t}" loading="lazy"
                 onerror="this.style.display='none'">
          </div>
          <div class="book-card__info">
            <p class="book-card__title">${t}</p>
            <p class="book-card__author">${a}</p>
            <div class="book-card__stars" aria-label="${b.rating ? b.rating + ' out of 5 stars' : 'not rated'}">
              ${starsHTML(b.rating)}
            </div>
          </div>
        </a>`;
    }).join('');
  }

  /* ── Filter ──────────────────────────────────────────────── */

  function applyFilter(filter) {
    filterBtns.forEach(btn =>
      btn.classList.toggle('active', btn.dataset.filter === filter)
    );
    const filtered = filter === 'all'
      ? allBooks
      : allBooks.filter(b => String(b.rating) === filter);
    renderBooks(filtered);
  }

  filterBtns.forEach(btn =>
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter))
  );

  /* ── Init ────────────────────────────────────────────────── */

  allBooks = BOOKS;

  if (countEl) {
    countEl.innerHTML =
      `<i class="fa-solid fa-book-open" aria-hidden="true"></i> ${allBooks.length} books read`;
  }

  renderBooks(allBooks);

})();
