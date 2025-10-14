<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => ['required','string','max:255'],
            'email'    => ['required','string','lowercase','email','max:255','unique:'.User::class],
            'password' => ['required','confirmed', Rules\Password::defaults()],
        ]);

        // 'password' sẽ tự hash nhờ casts trong User
        $user = User::create($data);

        event(new Registered($user));

        $token = $user->createToken('web')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token], 201);
    }
}
