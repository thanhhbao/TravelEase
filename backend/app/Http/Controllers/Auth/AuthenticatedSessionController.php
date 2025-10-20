<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    // App\Http\Controllers\Auth\AuthenticatedSessionController.php
public function store(Request $request)
{
    $data = $request->validate([
        'email'    => ['required','email'],
        'password' => ['required','string'],
    ]);

    $user = \App\Models\User::where('email', $data['email'])->first();

    if (! $user || ! \Illuminate\Support\Facades\Hash::check($data['password'], $user->password)) {
        return response()->json([
            'message' => 'The given data was invalid.',
            'errors'  => [
                'email' => ['These credentials do not match our records.']
            ]
        ], 422);
    }

    if (! $user->hasVerifiedEmail()) {
        return response()->json([
            'message' => 'Your email address is not verified.',
            'requires_email_verification' => true,
            'email' => $user->email,
        ], 409);
    }

    $token = $user->createToken('web')->plainTextToken;

    return response()->json(['user' => $user, 'token' => $token]);
}


    public function destroy(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->noContent();
    }
}
