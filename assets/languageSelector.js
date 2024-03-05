(function(){var __webpack_modules__={"./assets/js/languageSelector.js":
/*!***************************************!*\
  !*** ./assets/js/languageSelector.js ***!
  \***************************************/function(){eval('var mobileQuery = getComputedStyle(document.body).getPropertyValue("--phoneWidth");\n\nvar isMobile = function isMobile() {\n  return window.matchMedia(mobileQuery).matches;\n};\n\nvar languageSelector = document.querySelector(".language-selector-current");\nvar moreLanguagesContainer = document.querySelector(".language-selector__more");\ndocument.body.addEventListener("click", function () {\n  if (!isMobile() && moreLanguagesContainer && !moreLanguagesContainer.classList.contains("hidden")) {\n    moreLanguagesContainer.classList.add("hidden");\n  }\n});\nlanguageSelector && languageSelector.addEventListener("click", function (e) {\n  if (!isMobile()) {\n    e.stopPropagation();\n    moreLanguagesContainer.classList.toggle("hidden");\n  }\n});\n\n//# sourceURL=webpack://terminal-extended/./assets/js/languageSelector.js?')}},__webpack_exports__={};__webpack_modules__["./assets/js/languageSelector.js"]()})();