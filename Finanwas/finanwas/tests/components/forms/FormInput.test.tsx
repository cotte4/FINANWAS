import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormInput } from '@/components/forms/FormInput';

describe('FormInput', () => {
  it('should render input with label', () => {
    render(
      <FormInput
        id="test-input"
        label="Test Label"
        placeholder="Enter text"
      />
    );

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should display required asterisk when required is true', () => {
    render(
      <FormInput
        id="test-input"
        label="Required Field"
        required
      />
    );

    const asterisk = screen.getByLabelText('required');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveTextContent('*');
  });

  it('should display error message when error prop is provided', () => {
    render(
      <FormInput
        id="test-input"
        label="Test Label"
        error="This field is required"
      />
    );

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('This field is required');
  });

  it('should apply error styling when error is present', () => {
    render(
      <FormInput
        id="test-input"
        label="Test Label"
        error="Error message"
      />
    );

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should handle user input', async () => {
    const user = userEvent.setup();
    render(
      <FormInput
        id="test-input"
        label="Test Label"
      />
    );

    const input = screen.getByLabelText('Test Label');
    await user.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('should apply custom className to container', () => {
    const { container } = render(
      <FormInput
        id="test-input"
        label="Test Label"
        containerClassName="custom-container"
      />
    );

    const containerDiv = container.firstChild;
    expect(containerDiv).toHaveClass('custom-container');
  });

  it('should link error message to input with aria-describedby', () => {
    render(
      <FormInput
        id="test-input"
        label="Test Label"
        error="Error message"
      />
    );

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error');

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveAttribute('id', 'test-input-error');
  });

  it('should accept different input types', () => {
    render(
      <FormInput
        id="email-input"
        label="Email"
        type="email"
      />
    );

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should handle disabled state', () => {
    render(
      <FormInput
        id="test-input"
        label="Test Label"
        disabled
      />
    );

    const input = screen.getByLabelText('Test Label');
    expect(input).toBeDisabled();
  });
});
