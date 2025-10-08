import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './EventFormModal.module.css';
import './CustomDateTimePicker.css';
import formStyles from './EventCreationForm.module.css';

import ToggleSwitch from '../ToggleSwitch';

import ImageDropzone from '../ImageDropzone/ImageDropzone';

const EventFormModal = ({ event, dateStr, onClose, userRole }) => {
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [thumbnail, setThumbnail] = useState('');
  const [useLink, setUseLink] = useState(false);

  useEffect(() => {
    if (event) {
      setEventName(event.name || '');
      setEventDescription(event.description || '');
      setEventDate(event.date ? new Date(event.date) : new Date());
      setThumbnail(event.imageUrl || '');
    } else if (dateStr) {
      setEventDate(new Date(dateStr));
    }
  }, [event, dateStr]);

  const handleDateChange = (date) => {
    setEventDate(date);
  };

  const handleDrop = (base64) => {
    setThumbnail(base64);
  };

  const handleSave = async () => {
    // ... save logic
  };

  const handleDelete = async () => {
    // ... delete logic
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.modalContent} ${formStyles.glassmorphismContainer}`}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{event ? 'Edit Event' : 'Add Event'}</h2>
          <button onClick={onClose} className={styles.closeModalBtn}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className={styles.modalBody}>
          <form className={formStyles.formGrid}>
            <div className={formStyles.formColumn}>
              <div className={formStyles.inputGroup}>
                <label htmlFor="event-name">Event Name</label>
                <input
                  type="text"
                  id="event-name"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  maxLength="50"
                  placeholder="Enter event name"
                />
                <small>{eventName.length}/50</small>
              </div>
              <div className={formStyles.inputGroup}>
                <label htmlFor="event-date">Event Date & Time</label>
                <DatePicker
                  selected={eventDate}
                  onChange={handleDateChange}
                  showTimeSelect
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className={formStyles.datePicker}
                />
              </div>
              <div className={`${formStyles.inputGroup} ${formStyles.fullWidth}`}>
                <label htmlFor="event-description">Event Description</label>
                <textarea
                  id="event-description"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  maxLength="2500"
                  placeholder="Enter event description"
                  rows="10"
                />
                <small>{eventDescription.length}/2500</small>
              </div>
              <div className={formStyles.inputGroup}>
                <label>Thumbnail</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>Upload</span>
                  <ToggleSwitch isOn={useLink} handleToggle={() => setUseLink(!useLink)} />
                  <span>Link</span>
                </div>
              </div>
              {useLink ? (
                <div className={formStyles.inputGroup}>
                  <label htmlFor="thumbnail-link">Image Link</label>
                  <input
                    type="text"
                    id="thumbnail-link"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="Enter image URL"
                  />
                </div>
              ) : (
                <ImageDropzone onDrop={handleDrop} thumbnail={thumbnail} />
              )}
            </div>
          </form>
        </div>
        <div className={styles.modalFooter}>
            {event && <button onClick={handleDelete} className={styles.deleteBtn}>Delete</button>}
            <button onClick={handleSave} className={styles.saveBtn}>{event ? 'Save Changes' : 'Create Event'}</button>
        </div>
      </div>
    </div>
  );
};

export default EventFormModal;