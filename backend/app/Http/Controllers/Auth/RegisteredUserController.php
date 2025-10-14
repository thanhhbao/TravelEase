<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rule;

class RegisteredUserController extends Controller
{
    public function store(Request $request)
    {
        // Normalize email first so validation (especially unique) runs against normalized value
        if ($request->has('email')) {
            $request->merge(['email' => strtolower((string) $request->input('email'))]);
        }

        $data = $request->validate([
            'name'     => ['required','string','max:255'],
            'email'    => ['required','string','email','max:255', Rule::unique(User::class)],
            // Use a simpler rule during development to avoid strict password requirements
            'password' => ['required','confirmed','min:8'],
        ]);

        // 'password' sẽ tự hash nhờ casts trong User
        $user = User::create($data);

        event(new Registered($user));

        $token = $user->createToken('web')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token], 201);
    }
}
