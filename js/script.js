const books = [];
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "BOOKSHELF";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  const searchSubmit = document.getElementById("searchBook");

  searchSubmit.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year = 0, isCompleted) {
  return {
    id,
    title,
    author,
    year: parseInt(year),
    isCompleted,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const unreadBookList = document.getElementById("incompleteBookshelfList");
  const readBookList = document.getElementById("completeBookshelfList");
  unreadBookList.innerHTML = "";
  readBookList.innerHTML = "";

  for (const book of books) {
    const bookData = displayBook(book);
    if (book.isCompleted) {
      readBookList.append(bookData);
    } else {
      unreadBookList.append(bookData);
    }
  }
});

function addBook() {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const id = generateId() + title;

  const book = generateBookObject(id, title, author, year, false);

  books.push(book);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function displayBook(book) {
  const bookData = document.createElement("article");
  bookData.classList.add("book_item");

  const bookTitle = document.createElement("h3");
  bookTitle.innerText = book.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = book.author;

  const bookYear = document.createElement("p");
  bookYear.innerText = book.year;

  const bookAction = document.createElement("div");
  bookAction.classList.add("action");

  const bookActionComplete = document.createElement("button");
  bookActionComplete.classList.add("green");
  bookActionComplete.innerText = "Selesai dibaca";
  bookActionComplete.addEventListener("click", function () {
    addBookToCompleted(book.id);
  });

  const bookActionUndo = document.createElement("button");
  bookActionUndo.classList.add("green");
  bookActionUndo.innerText = "Belum Selesai dibaca";
  bookActionUndo.addEventListener("click", function () {
    removeBookfromCompleted(book.id);
  });

  const bookActionDelete = document.createElement("button");
  bookActionDelete.classList.add("red");
  bookActionDelete.innerText = "Hapus buku";
  bookActionDelete.addEventListener("click", function () {
    showDeleteModal(book.id);
  });

  const bookActionEdit = document.createElement("button");
  bookActionEdit.classList.add("blue");
  bookActionEdit.innerText = "Edit buku";
  bookActionEdit.addEventListener("click", function () {
    showEditModal(book.id);
  });

  if (book.isCompleted) {
    bookAction.append(bookActionUndo, bookActionDelete, bookActionEdit);
  } else {
    bookAction.append(bookActionComplete, bookActionDelete, bookActionEdit);
  }

  bookData.append(bookTitle, bookAuthor, bookYear, bookAction);

  return bookData;
}

function addBookToCompleted(id) {
  const book = findBook(id);
  if (book == null) return;
  book.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function showEditModal(id) {
  const modal = document.getElementById("editModal");
  const titleInput = document.getElementById("editBookTitle");
  const authorInput = document.getElementById("editBookAuthor");
  const yearInput = document.getElementById("editBookYear");
  const editButton = document.getElementById("editButton");
  const cancelButton = document.getElementById("cancelEditButton");

  const book = findBook(id);
  if (book === null) return;

  titleInput.value = book.title;
  authorInput.value = book.author;
  yearInput.value = book.year;

  editButton.addEventListener("click", function () {
    book.title = titleInput.value;
    book.author = authorInput.value;
    book.year = yearInput.value;
    modal.style.display = "none";
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  });

  cancelButton.addEventListener("click", function () {
    modal.style.display = "none";
  });

  modal.style.display = "block";
}

function showDeleteModal(id) {
  const modal = document.getElementById("deleteModal");
  const deleteButton = document.getElementById("deleteButton");
  const cancelButton = document.getElementById("cancelButton");

  deleteButton.addEventListener("click", function () {
    modal.style.display = "none";
    removeBook(id);
  });

  cancelButton.addEventListener("click", function () {
    modal.style.display = "none";
  });

  modal.style.display = "block";
}

function removeBook(id) {
  const bookIndex = books.findIndex((book) => book.id === id);
  console.log(bookIndex, "yang di delete");
  if (bookIndex === -1) return;
  books.splice(bookIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookfromCompleted(id) {
  const book = findBook(id);
  if (book == null) return;
  book.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(id) {
  for (const book of books) {
    if (book.id === id) {
      return book;
    }
  }
  return null;
}

function findBookwithInput(input) {
  const filteredBooks = books.filter((book) => {
    return (
      book.title.toLowerCase().includes(input.toLowerCase()) ||
      book.author.toLowerCase().includes(input.toLowerCase()) ||
      book.year.toString().includes(input.toString())
    );
  });

  return filteredBooks;
}

function searchBook() {
  const searchInput = document.getElementById("searchBookTitle").value;
  const searchResult = findBookwithInput(searchInput);
  const unreadBookList = document.getElementById("incompleteBookshelfList");
  const readBookList = document.getElementById("completeBookshelfList");
  unreadBookList.innerHTML = "";
  readBookList.innerHTML = "";

  for (const book of searchResult) {
    const bookData = displayBook(book);
    if (book.isCompleted) {
      readBookList.append(bookData);
    } else {
      unreadBookList.append(bookData);
    }
  }
}

const SAVED_EVENT = "saved-books";

function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
