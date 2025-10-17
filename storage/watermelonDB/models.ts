import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

// User Model
export class User extends Model {
  static table = 'users';

  @field('name') name!: string;
  @field('age') age!: number;
  @field('address') address?: string;
  @field('is_married') isMarried!: boolean;
  @field('about_him') aboutHim?: string; // JSON serialized
  @field('his_family') hisFamily?: string; // JSON serialized array
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  // Helper methods for JSON fields
  getAboutHimObject(): Record<string, unknown> | null {
    return this.aboutHim ? JSON.parse(this.aboutHim) : null;
  }

  setAboutHimObject(obj: Record<string, unknown> | null): void {
    this.aboutHim = obj ? JSON.stringify(obj) : undefined;
  }

  getHisFamilyArray(): unknown[] | null {
    return this.hisFamily ? JSON.parse(this.hisFamily) : null;
  }

  setHisFamilyArray(arr: unknown[] | null): void {
    this.hisFamily = arr ? JSON.stringify(arr) : undefined;
  }
}

// Bank Model
export class Bank extends Model {
  static table = 'banks';

  @field('bank_name') bankName!: string;
  @field('bank_id') bankId!: string;
  @field('user_id') userId!: string; // Foreign key to users
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
