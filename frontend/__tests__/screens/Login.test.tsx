import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../../src/screens/Login';
import { api } from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';

jest.mock('../../src/utils/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('登录功能', () => {
    beforeEach(() => {
        useAuthStore.setState({ token: null });
        jest.clearAllMocks();
    });

    test('正常密码登录', async () => {
        mockedApi.post.mockResolvedValueOnce({ data: { token: 'fake-jwt' } });

        render(<Login />);
        fireEvent.change(screen.getByLabelText('手机号'), { target: { value: '13800138000' } });
        fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'Password123' } });
        fireEvent.click(screen.getByText('登录'));

        await waitFor(() => {
            expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', {
                phone: '13800138000',
                password: 'Password123',
            });
            expect(useAuthStore.getState().token).toBe('fake-jwt');
        });
    });

    test('密码错误', async () => {
        mockedApi.post.mockRejectedValueOnce({
            response: { data: { code: 1002, message: '密码错误' } },
        });

        render(<Login />);
        fireEvent.change(screen.getByLabelText('手机号'), { target: { value: '13800138000' } });
        fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByText('登录'));

        await waitFor(() => {
            expect(screen.getByText('密码错误')).toBeInTheDocument();
            expect(useAuthStore.getState().token).toBeNull();
        });
    });

    // 其他测试用例按YAML场景生成...
});