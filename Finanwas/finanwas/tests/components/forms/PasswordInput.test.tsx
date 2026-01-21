import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordInput } from '@/components/forms/PasswordInput';

describe('PasswordInput', () => {
  it('should render password input with label', () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        placeholder="Enter password"
      />
    );

    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
  });

  it('should initially hide password', () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
      />
    );

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should toggle password visibility when eye icon is clicked', async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        id="password"
        label="Password"
      />
    );

    const input = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    // Initially password should be hidden
    expect(input).toHaveAttribute('type', 'password');

    // Click to show password
    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

    // Click to hide password again
    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should display error message when error prop is provided', () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        error="Password is required"
      />
    );

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('Password is required');
  });

  it('should show password strength indicator when showStrength is true', async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        id="password"
        label="Password"
        value=""
        showStrength
      />
    );

    // Strength indicator should not appear with empty password
    expect(screen.queryByText(/Password strength:/)).not.toBeInTheDocument();

    // Re-render with a password value
    const { rerender } = render(
      <PasswordInput
        id="password"
        label="Password"
        value="Weak1"
        showStrength
      />
    );

    // Now strength indicator should appear
    expect(screen.getByText(/Password strength:/)).toBeInTheDocument();
  });

  it('should calculate weak password strength correctly', () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        value="weak"
        showStrength
      />
    );

    expect(screen.getByText(/Weak/)).toBeInTheDocument();
  });

  it('should calculate strong password strength correctly', () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        value="StrongPass123!@#"
        showStrength
      />
    );

    expect(screen.getByText(/Strong/)).toBeInTheDocument();
  });

  it('should display required asterisk when required is true', () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        required
      />
    );

    const asterisk = screen.getByLabelText('required');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveTextContent('*');
  });

  it('should apply error styling when error is present', () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        error="Error message"
      />
    );

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should handle user input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <PasswordInput
        id="password"
        label="Password"
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText('Password');
    await user.type(input, 'SecurePass123');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should be accessible with keyboard navigation', async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        id="password"
        label="Password"
      />
    );

    const toggleButton = screen.getByRole('button', { name: /show password/i });

    // Tab to the button and press Enter
    await user.tab();
    await user.tab(); // First tab goes to input, second to button
    await user.keyboard('{Enter}');

    // Password should be visible
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'text');
  });
});
