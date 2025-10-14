<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * Các URI được bỏ qua khi kiểm tra CSRF.
     *
     * @var array<int, string>
     */
    protected $except = [
        'api/*',
    ];
}
