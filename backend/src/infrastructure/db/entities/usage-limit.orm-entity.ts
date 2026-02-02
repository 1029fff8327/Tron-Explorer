import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('usage_limits')
@Index(['userId', 'dayUtc'], { unique: true })
export class UsageLimitOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 10 })
  dayUtc!: string;

  @Column({ type: 'int', default: 0 })
  count!: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
