import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';

export interface ISSLPaymentInitData {
  total_amount: number;
  tran_id: string;
  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_city: string;
  cus_postcode?: string;
  cus_country?: string;
  cus_phone: string;
}

@Injectable()
export class SSLCommerzService {
  private readonly logger = new Logger(SSLCommerzService.name);

  private readonly storeId = process.env.SSLCOMMERZ_STORE_ID || 'testbox';
  private readonly storePassword =
    process.env.SSLCOMMERZ_STORE_PASSWORD || 'qwerty';
  private readonly initUrl =
    process.env.SSLCOMMERZ_INIT_URL ||
    'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';
  private readonly validationUrl =
    process.env.SSLCOMMERZ_VALIDATION_URL ||
    'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';
  private readonly backendUrl =
    process.env.BACKEND_BASE_URL || 'http://localhost:5000/api/v1';

  async initPayment(orderData: ISSLPaymentInitData): Promise<string> {
    const payload = {
      store_id: this.storeId,
      store_passwd: this.storePassword,
      total_amount: orderData.total_amount,
      currency: 'BDT',
      tran_id: orderData.tran_id,
      success_url: `${this.backendUrl}/order/payment/sslcommerz/success?tran_id=${orderData.tran_id}`,
      fail_url: `${this.backendUrl}/order/payment/sslcommerz/fail?tran_id=${orderData.tran_id}`,
      cancel_url: `${this.backendUrl}/order/payment/sslcommerz/cancel?tran_id=${orderData.tran_id}`,
      ipn_url: `${this.backendUrl}/order/payment/sslcommerz/ipn`,
      shipping_method: 'NO',
      product_name: 'e-com Store Order',
      product_category: 'General',
      product_profile: 'general',
      cus_name: orderData.cus_name,
      cus_email: orderData.cus_email,
      cus_add1: orderData.cus_add1,
      cus_city: orderData.cus_city || 'Dhaka',
      cus_postcode: orderData.cus_postcode || '1000',
      cus_country: orderData.cus_country || 'Bangladesh',
      cus_phone: orderData.cus_phone,
    };

    try {
      const response = await axios.post(
        this.initUrl,
        new URLSearchParams(payload as any).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      if (response.data?.status === 'SUCCESS') {
        return response.data.GatewayPageURL;
      }

      this.logger.error('SSLCommerz Init Error:', response.data);
      throw new InternalServerErrorException(
        response.data?.failedreason || 'Payment session initialization failed',
      );
    } catch (error: any) {
      this.logger.error('Error initPayment:', error.message);
      throw new InternalServerErrorException(
        error.message || 'SSLCommerz payment error',
      );
    }
  }

  async validatePayment(val_id: string): Promise<boolean> {
    if (!val_id) return false;
    try {
      const response = await axios.get(this.validationUrl, {
        params: {
          val_id,
          store_id: this.storeId,
          store_passwd: this.storePassword,
          format: 'json',
        },
      });

      return (
        response.data?.status === 'VALID' ||
        response.data?.status === 'VALIDATED'
      );
    } catch (error: any) {
      this.logger.error('Validation Error:', error.message);
      return false;
    }
  }
}
