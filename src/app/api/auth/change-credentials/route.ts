import { NextResponse } from "next/server";
import { verifyPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { getSession } from "@/lib/server-auth";
import { findUserByUsername, updateUserCredentials, getAdminUser } from "@/lib/data-store";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newUsername, newPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required to make security changes." },
        { status: 400 }
      );
    }

    // Find current user in store
    let user = await findUserByUsername(session.username);
    if (!user) {
      user = await getAdminUser();
    }
    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    // Verify current password
    const isCurrentValid = verifyPassword(currentPassword, user.password, user.salt);
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "Incorrect current password. Verification failed." },
        { status: 400 }
      );
    }

    const updatedUsername = (newUsername && newUsername.trim()) ? newUsername.trim() : user.username;

    // Check if new username conflicts with another user
    if (updatedUsername.toLowerCase() !== user.username.toLowerCase()) {
      const existing = await findUserByUsername(updatedUsername);
      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { error: `Username '${updatedUsername}' is already taken.` },
          { status: 400 }
        );
      }
    }

    if (newPassword && newPassword.trim().length < 4) {
      return NextResponse.json(
        { error: "New password must be at least 4 characters long." },
        { status: 400 }
      );
    }

    // Update credentials
    const updated = await updateUserCredentials(
      user.id,
      updatedUsername,
      newPassword && newPassword.trim() ? newPassword.trim() : undefined
    );

    if (!updated) {
      return NextResponse.json({ error: "Failed to update credentials." }, { status: 500 });
    }

    const newSessionUser = {
      id: updated.id,
      username: updated.username,
      name: updated.name || "Administrator",
      role: updated.role || "admin",
    };

    const token = createSessionToken(newSessionUser);

    const response = NextResponse.json({
      success: true,
      message: "Credentials updated successfully!",
      user: newSessionUser,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 72 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Change credentials error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating credentials." },
      { status: 500 }
    );
  }
}
