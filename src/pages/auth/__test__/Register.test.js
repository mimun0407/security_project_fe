import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from '../Register';
import userService from '../../../services/userService';

import axios from 'axios';

// Mock userService
jest.mock('../../../services/userService');
// Mock axios for auto-login and axiosClient initialization
jest.mock('axios', () => {
    return {
        create: jest.fn(() => ({
            interceptors: {
                request: { use: jest.fn() },
                response: { use: jest.fn() }
            },
            get: jest.fn(),
            post: jest.fn()
        })),
        post: jest.fn(),
        get: jest.fn()
    };
});

// Mock AuthContext login function
const mockLogin = jest.fn();
jest.mock('../../../context/AuthContext', () => ({
    ...jest.requireActual('../../../context/AuthContext'),
    useAuth: () => ({
        login: mockLogin,
    }),
}));

const renderWithRouter = (component) => {
    return render(
        <MemoryRouter>
            {component}
        </MemoryRouter>
    );
};

describe('Register Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders initial email step', () => {
        renderWithRouter(<Register />);
        expect(screen.getByPlaceholderText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
    });

    test('Step 1: Submits email and moves to OTP step on success', async () => {
        userService.sendOtpRegister.mockResolvedValue({ success: true });

        renderWithRouter(<Register />);

        const emailInput = screen.getByPlaceholderText(/Email Address/i);
        const nextButton = screen.getByText(/Next/i);

        userEvent.type(emailInput, 'test@example.com');
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(userService.sendOtpRegister).toHaveBeenCalledWith('test@example.com');
        });

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Enter OTP/i)).toBeInTheDocument();
        });
    });

    test('Step 1: Shows error message on failure', async () => {
        userService.sendOtpRegister.mockResolvedValue({ success: false, message: 'Invalid Email' });

        renderWithRouter(<Register />);

        const emailInput = screen.getByPlaceholderText(/Email Address/i);
        const nextButton = screen.getByText(/Next/i);

        userEvent.type(emailInput, 'wrong@test.com');
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText(/Invalid Email/i)).toBeInTheDocument();
        });
    });

    test('Step 2: Submits OTP and moves to Details step on success', async () => {
        // Setup: Move to Step 2 manually or by simulating Step 1 success
        userService.sendOtpRegister.mockResolvedValue({ success: true });
        userService.verifyOtpRegister.mockResolvedValue({ success: true });

        renderWithRouter(<Register />);

        // Step 1
        userEvent.type(screen.getByPlaceholderText(/Email Address/i), 'test@example.com');
        fireEvent.click(screen.getByText(/Next/i));

        await screen.findByPlaceholderText(/Enter OTP/i);

        // Step 2
        const otpInput = screen.getByPlaceholderText(/Enter OTP/i);
        const verifyButton = screen.getByText(/Verify/i);

        userEvent.type(otpInput, '123456');
        fireEvent.click(verifyButton);

        await waitFor(() => {
            expect(userService.verifyOtpRegister).toHaveBeenCalledWith('test@example.com', '123456');
        });

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
        });
    });

    test('Step 3: Register success and Auto Login', async () => {
        // Setup flow until step 3
        userService.sendOtpRegister.mockResolvedValue({ success: true });
        userService.verifyOtpRegister.mockResolvedValue({ success: true });
        userService.register.mockResolvedValue({ success: true });

        // Mock axios post for auto-login
        axios.post.mockResolvedValue({
            data: {
                token: 'fake-token',
                refreshToken: 'fake-refresh',
                role: ['USER'],
                idUser: '123',
                email: 'test@example.com'
            }
        });

        renderWithRouter(<Register />);

        // Step 1
        userEvent.type(screen.getByPlaceholderText(/Email Address/i), 'test@example.com');
        fireEvent.click(screen.getByText(/Next/i));
        await screen.findByPlaceholderText(/Enter OTP/i);

        // Step 2
        userEvent.type(screen.getByPlaceholderText(/Enter OTP/i), '123456');
        fireEvent.click(screen.getByText(/Verify/i));
        await screen.findByPlaceholderText(/Full Name/i);

        // Step 3
        userEvent.type(screen.getByPlaceholderText(/Full Name/i), 'Test User');
        userEvent.type(screen.getByPlaceholderText(/^Password$/i), 'password123'); // Regex for exact match to avoid Confirm Password
        userEvent.type(screen.getByPlaceholderText(/Confirm Password/i), 'password123');

        fireEvent.click(screen.getByText(/Sign Up/i));

        await waitFor(() => {
            expect(userService.register).toHaveBeenCalledWith({
                name: 'Test User',
                password: 'password123',
                rePassword: 'password123',
                email: 'test@example.com'
            });
        });

        await waitFor(() => {
            expect(screen.getByText(/Registration successful!/i)).toBeInTheDocument();
        });

        // Verify Auto Login called
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalled();
        });
    });
});
