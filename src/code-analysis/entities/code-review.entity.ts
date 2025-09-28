import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('code_reviews')
export class CodeReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'text' })
  originalCode: string;

  @Column({ type: 'text', nullable: true })
  improvedCode: string;

  @Column()
  language: string;

  @Column({ nullable: true })
  detectedLanguage: string;

  @Column({ nullable: true })
  score: number;

  @Column({ type: 'jsonb' })
  issues: any; // Will store the issues array as JSON

  @Column({ type: 'text', array: true, nullable: true })
  suggestions: string[];

  @Column({ nullable: true })
  analysisType: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.codeReviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}