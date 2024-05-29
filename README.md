# Urlaubsplaner

This is an web application that allows you to plan trips with family or friends. The main components are followed by

1. You can collaboratively plan your trip before or during your travel.
2. You can set a travel budget and manage expenses together.
3. You can receive recommendations for things to experience in the country or city you are visiting.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Technology stacks

### Environment

<img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white"> <img src="https://img.shields.io/badge/vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"> <img src="https://img.shields.io/badge/visual studio code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white"> <img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white"> <img src="https://img.shields.io/badge/git-F05032?style=for-the-badge&logo=git&logoColor=white">

### Config

<img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white">

### Language

<img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"> <img src="https://img.shields.io/badge/python-3776AB?style=for-the-badge&logo=python&logoColor=white">

### Framework

<img src="https://img.shields.io/badge/vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white">

### Database

<img src="https://img.shields.io/badge/firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white">

## Usage

### 1. Sign up/in

<p align="middle">
    <img src="https://github.com/Daeun271/UrlaubsPlaner/blob/main/urlaub-planer-images/signUp.png" width="40%">
    <img src="https://github.com/Daeun271/UrlaubsPlaner/blob/main/urlaub-planer-images/signIn.png" width="40%">
</p>

### 2. Group overview

Once the user successfully signs up or logs in, they will be automatically routed to this page. Here, the user can see all their groups.

<img src="https://github.com/Daeun271/UrlaubsPlaner/blob/main/urlaub-planer-images/userPage.png" width="70%">

<img src="https://github.com/Daeun271/UrlaubsPlaner/blob/main/urlaub-planer-images/createGroup.png" width="50%">

On this page, the user can also create a group with friends to travel together.

<img src="https://github.com/Daeun271/UrlaubsPlaner/blob/main/urlaub-planer-images/invite.png" width="50%">

The user can view brief information about each travel group. Additionally, they can invite friends to join the group by copying a link or through social media. Invited friends will be automatically routed to this page upon successfully signing up or logging in.

### 3. Plan

<img src="https://github.com/Daeun271/UrlaubsPlaner/blob/main/urlaub-planer-images/plan.png" width="70%">

<img src="https://github.com/Daeun271/UrlaubsPlaner/blob/main/urlaub-planer-images/addActivity.png" width="70%">

### 4. Chat

<img src="https://github.com/Daeun271/UrlaubsPlaner/blob/main/urlaub-planer-images/chat.png" width="70%">

### 5. Expense

Users can enter all expenses incurred during the trip.

<img src="https://github.com/Daeun271/UrlaubsPlaner/blob/main/urlaub-planer-images/expensePage.png" width="70%">

-   In addition to travel expenses, a travel budget is created based on the costs of activities planned on the "Plan" page. As travel expenses occur, the current expenditure is updated. All these amounts are displayed in both the user's desired currency and the currency of the travel destination. Exchange rates are updated daily using the ExchangeRate API.
-   After the trip ends, the total travel cost is divided equally among the members (1/N), allowing users to see who owes money to whom and who should receive money from whom.

### 6. Recommendation

The user will get recommendations for things to do in the country or city they are planning to visit.

<img src="https://github.com/Daeun271/UrlaubsPlaner/blob/main/urlaub-planer-images/recommendationPage.png" width="70%">

When generating a recommendation list for a city, fuzzy matching with the Levenshtein algorithm will be used.

### 7. User setting

<img src="https://github.com/Daeun271/UrlaubsPlaner/blob/main/urlaub-planer-images/settingPage.png" width="70%">

<img src="https://github.com/Daeun271/UrlaubsPlaner/blob/main/urlaub-planer-images/profileChange.png" width="50%">
