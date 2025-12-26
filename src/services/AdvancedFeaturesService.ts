import { Share, Alert } from 'react-native';

/**
 * Advanced Features Module
 * - Social Sharing
 * - Receipt Generation
 * - Community Feed Integration
 * - Enhanced Analytics
 */

// Social Sharing Service
export class SocialSharingService {
  static async shareReceipt(
    title: string,
    message: string,
    url?: string
  ): Promise<boolean> {
    try {
      const result = await Share.share(
        {
          message: `${title}\n\n${message}${url ? `\n\n${url}` : ''}`,
          title,
          url,
        },
        { dialogTitle: 'Share Your SwipeSavvy Impact' }
      );

      return result.action === Share.dismissedAction ? false : true;
    } catch (error) {
      console.error('Share error:', error);
      return false;
    }
  }

  static async shareToTwitter(text: string): Promise<void> {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    // Use linking service to open URL
    // Linking.openURL(twitterUrl);
  }

  static async shareToLinkedin(message: string): Promise<void> {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(message)}`;
    // Use linking service to open URL
    // Linking.openURL(linkedinUrl);
  }

  static async shareToFacebook(message: string): Promise<void> {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(message)}`;
    // Use linking service to open URL
    // Linking.openURL(facebookUrl);
  }
}

// Receipt Model
export interface Receipt {
  id: string;
  type: 'donation' | 'transfer' | 'payment';
  amount: number;
  currency: string;
  date: Date;
  description: string;
  recipient?: string;
  cause?: string;
  impact?: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  fee?: number;
  total?: number;
}

// Receipt Generator Service
export class ReceiptGenerator {
  static generateReceiptText(receipt: Receipt): string {
    const dateStr = receipt.date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const timeStr = receipt.date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let receiptText = `SwipeSavvy Receipt\n`;
    receiptText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    receiptText += `Type: ${receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)}\n`;
    receiptText += `Amount: ${receipt.currency}${receipt.amount.toFixed(2)}\n`;
    receiptText += `Date: ${dateStr} at ${timeStr}\n`;
    receiptText += `Status: ${receipt.status.toUpperCase()}\n\n`;

    if (receipt.description) {
      receiptText += `Description: ${receipt.description}\n`;
    }

    if (receipt.recipient) {
      receiptText += `Recipient: ${receipt.recipient}\n`;
    }

    if (receipt.cause) {
      receiptText += `Cause: ${receipt.cause}\n`;
    }

    if (receipt.fee) {
      receiptText += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      receiptText += `Subtotal: ${receipt.currency}${receipt.amount.toFixed(2)}\n`;
      receiptText += `Fee: ${receipt.currency}${receipt.fee.toFixed(2)}\n`;
      receiptText += `Total: ${receipt.currency}${receipt.total?.toFixed(2) || (receipt.amount + receipt.fee).toFixed(2)}\n`;
    }

    if (receipt.impact) {
      receiptText += `\nImpact: ${receipt.impact}\n`;
    }

    receiptText += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    receiptText += `Transaction ID: ${receipt.transactionId}\n`;
    receiptText += `\nThank you for your generosity! 🎉\n`;

    return receiptText;
  }

  static async saveReceiptAsImage(receipt: Receipt): Promise<string | null> {
    // Implementation would use a library like canvas or react-native-view-shot
    // This is a placeholder for the actual implementation
    try {
      const receiptText = this.generateReceiptText(receipt);
      // In a real implementation, convert text to image and save to storage
      return `file:///path/to/receipt_${receipt.id}.png`;
    } catch (error) {
      console.error('Failed to save receipt as image:', error);
      return null;
    }
  }

  static async saveToPDF(receipt: Receipt): Promise<string | null> {
    // Implementation would use a library like react-native-pdf-lib
    try {
      const receiptText = this.generateReceiptText(receipt);
      // In a real implementation, generate PDF
      return `file:///path/to/receipt_${receipt.id}.pdf`;
    } catch (error) {
      console.error('Failed to save receipt as PDF:', error);
      return null;
    }
  }
}

/**
 * React components are in:
 * - src/components/SocialShareModal.tsx
 * - src/components/ReceiptCard.tsx
 */
