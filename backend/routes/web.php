<?php

use Illuminate\Support\Facades\Route;

// (tuỳ bạn) nếu là SPA: tất cả GET => trả view('app') hoặc file index
Route::get('/', function () {
    return view('welcome'); // hoặc view SPA
});

// KHÔNG có: /register, /login, /logout, /forgot-password, /reset-password ở web.php
