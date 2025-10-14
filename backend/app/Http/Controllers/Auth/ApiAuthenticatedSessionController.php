<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ApiAuthenticatedSessionController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required','email'],
            'password' => ['required','string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
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
